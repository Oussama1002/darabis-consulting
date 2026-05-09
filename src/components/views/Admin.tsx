import React from 'react';
import { 
  ShieldCheck, 
  Users, 
  Key, 
  History, 
  Lock, 
  UserPlus,
  MoreVertical,
  Mail,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const Admin: React.FC = () => {
  const users = [
    { name: 'Ahmed Bennani', role: 'Administrateur', email: 'a.bennani@darbis.ma', status: 'ACTIVE' },
    { name: 'Sara Fassi', role: 'Comptable', email: 's.fassi@darbis.ma', status: 'ACTIVE' },
    { name: 'Youssef Alami', role: 'Agent Recouvrement', email: 'y.alami@darbis.ma', status: 'ACTIVE' },
    { name: 'Imane Drissi', role: 'Consultante', email: 'i.drissi@darbis.ma', status: 'INACTIVE' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Administration & Sécurité</h2>
          <p className="text-slate-500 text-sm">Gérez les accès, les rôles et surveillez l'activité du système.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-darbis-green text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-darbis-green-dark transition-all shadow-sm">
            <UserPlus className="w-4 h-4" />
            Nouvel Utilisateur
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 premium-card overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Équipe & Utilisateurs</h3>
              <div className="flex items-center gap-2">
                 <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><Users className="w-4 h-4" /></button>
                 <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><Key className="w-4 h-4" /></button>
              </div>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <tbody className="divide-y divide-slate-50">
                  {users.map((user, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                       <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                                {user.name.charAt(0)}
                             </div>
                             <div>
                                <h4 className="text-sm font-bold text-slate-900">{user.name}</h4>
                                <div className="flex items-center gap-2">
                                   <Mail className="w-3 h-3 text-slate-300" />
                                   <span className="text-xs text-slate-400">{user.email}</span>
                                </div>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-5">
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                             {user.role}
                          </span>
                       </td>
                       <td className="px-6 py-5">
                          <span className={cn(
                            "w-2 h-2 rounded-full inline-block mr-2",
                            user.status === 'ACTIVE' ? "bg-green-500" : "bg-slate-300"
                          )}></span>
                          <span className="text-xs font-semibold text-slate-500 uppercase">{user.status === 'ACTIVE' ? 'Actif' : 'Désactivé'}</span>
                       </td>
                       <td className="px-6 py-5 text-right">
                          <button className="p-2 text-slate-300 hover:text-slate-600">
                             <MoreVertical className="w-4 h-4" />
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
             </table>
           </div>
        </div>
        
        <div className="space-y-6">
           <div className="premium-card p-6 bg-darbis-blue-dark text-white">
              <div className="flex items-center gap-3 mb-6">
                 <Lock className="w-5 h-5 text-darbis-gold" />
                 <h3 className="font-bold">Journal d'Audit</h3>
              </div>
              <div className="space-y-4">
                 {[
                   { action: 'Facture supprimée', user: 'Ahmed B.', time: 'Il y a 10m' },
                   { action: 'Connexion réussie', user: 'Sara F.', time: 'Il y a 45m' },
                   { action: 'Rôle modifié', user: 'Admin', time: 'Hier 18:30' },
                   { action: 'Paiement manuel', user: 'Youssef A.', time: 'Hier 11:20' },
                 ].map((log, i) => (
                   <div key={i} className="flex justify-between items-start text-sm">
                      <div>
                         <p className="font-medium text-white/90">{log.action}</p>
                         <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{log.user}</p>
                      </div>
                      <span className="text-[10px] text-darbis-gold font-bold">{log.time}</span>
                   </div>
                 ))}
              </div>
              <button className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest border border-white/10 transition-all">
                 Voir tout l'historique
              </button>
           </div>
           
           <div className="premium-card p-6 border-2 border-red-50 text-red-800">
              <div className="flex items-center gap-3 mb-4">
                 <ShieldAlert className="w-6 h-6" />
                 <h3 className="font-bold">Zone de Danger</h3>
              </div>
              <p className="text-xs leading-relaxed opacity-70 mb-6">
                 Certaines actions d'administration sont irréversibles et impactent l'ensemble de la plateforme Darbis.
              </p>
              <button className="text-xs font-bold text-red-600 hover:underline underline-offset-4">Modifier les permissions globales</button>
           </div>
        </div>
      </div>
    </div>
  );
};
