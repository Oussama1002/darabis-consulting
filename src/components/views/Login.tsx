import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useData } from '../../store/DataContext';
import { useToast } from '../ui/Toast';

export const Login: React.FC = () => {
  const { login, users } = useData();
  const { toast } = useToast();
  const [email, setEmail] = useState('a.bennani@darbis.ma');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!exists) {
      setError('Email inconnu. Essayez a.bennani@darbis.ma');
      return;
    }
    if (password.length < 4) {
      setError('Le mot de passe doit faire au moins 4 caractères.');
      return;
    }
    login(email, password);
    toast(`Bienvenue ${exists.name.split(' ')[0]} !`, 'success');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full sidebar-gradient -skew-x-12 translate-x-1/4 hidden lg:block opacity-10"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-darbis-green rounded-2xl flex items-center justify-center shadow-2xl mb-6 transform rotate-6 border-4 border-white">
            <span className="text-white text-4xl font-bold font-serif">DB</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-center">Bureau Darbis Consulting</h1>
          <p className="text-slate-500 mt-2 text-center">Système de Gestion Financière & Créances</p>
        </div>

        <div className="premium-card p-10 relative bg-white/80 backdrop-blur-sm border-white">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-1 rounded-full border border-slate-100 flex items-center gap-2 shadow-sm">
            <Shield className="w-4 h-4 text-darbis-green" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Accès Sécurisé</span>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Adresse Email</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-darbis-blue transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-darbis-blue/30 focus:ring-4 focus:ring-darbis-blue/5 transition-all font-medium text-slate-700"
                  placeholder="nom@darbis.ma"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mot de passe</label>
                <a href="#" className="text-xs font-bold text-darbis-blue hover:underline">Oublié?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-darbis-blue transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-darbis-blue/30 focus:ring-4 focus:ring-darbis-blue/5 transition-all font-medium text-slate-700"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-14 bg-darbis-green text-white rounded-xl font-bold text-sm tracking-wide hover:bg-darbis-green-dark transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              Connexion au Portail
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 p-3 bg-slate-50 rounded-xl text-xs text-slate-500 leading-relaxed">
            <p className="font-bold text-slate-600 mb-1">Comptes de démo :</p>
            <p>• a.bennani@darbis.ma (Admin)</p>
            <p>• s.fassi@darbis.ma (Comptable)</p>
            <p>• y.alami@darbis.ma (Recouvrement)</p>
            <p className="mt-1 text-slate-400">Mot de passe : 4+ caractères au choix.</p>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-xs text-slate-400">
              © 2026 Bureau Darbis Consulting. <br/>
              Plateforme Propriétaire et Confidentielle.
            </p>
          </div>
        </div>

        <div className="mt-12 flex justify-center gap-8 text-slate-400 grayscale opacity-50">
          {/* Subtle branding or trust signals */}
          <span className="text-[10px] font-bold uppercase tracking-widest text-darbis-gold">Stratégie</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-darbis-blue">Finance</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-darbis-green">Conseil</span>
        </div>
      </motion.div>
    </div>
  );
};
