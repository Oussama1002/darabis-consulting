import React, { useState } from 'react';
import { Search, Bell, HelpCircle, Mail, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useData } from '../../store/DataContext';
import { useToast } from '../ui/Toast';

const roleLabel: Record<string, string> = {
  ADMIN: 'Administrateur',
  ACCOUNTANT: 'Comptable',
  RECOVERY_AGENT: 'Agent Recouvrement',
  FINANCIAL_MANAGER: 'Resp. Financier',
};

export const Navbar: React.FC = () => {
  const { currentUser, logout, invoices, recoveryCases } = useData();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const overdue = invoices.filter((i) => i.status === 'OVERDUE').length;
  const critical = recoveryCases.filter((r) => r.priority === 'CRITICAL').length;
  const notifCount = overdue + critical;

  if (!currentUser) return null;

  return (
    <header className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-200 fixed top-0 right-0 left-72 z-30 px-8 flex items-center justify-between">
      <div className="flex-1 flex items-center">
        <div className="relative w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-darbis-blue transition-colors" />
          <input
            type="text"
            placeholder="Rechercher un client, une facture..."
            className="w-full bg-slate-100/50 border border-transparent focus:border-darbis-blue/30 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => toast('Aucun nouveau message', 'info')}
          className="p-2 text-slate-400 hover:text-darbis-blue hover:bg-darbis-blue/5 rounded-full transition-all relative"
        >
          <Mail className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-darbis-gold rounded-full border-2 border-white"></span>
        </button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="p-2 text-slate-400 hover:text-darbis-blue hover:bg-darbis-blue/5 rounded-full transition-all relative"
          >
            <Bell className="w-5 h-5" />
            {notifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center">
                {notifCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20">
                <div className="p-4 border-b border-slate-100">
                  <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {overdue > 0 && (
                    <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Factures en retard</p>
                      <p className="text-sm text-slate-700 mt-1">{overdue} facture{overdue > 1 ? 's' : ''} ont dépassé leur échéance</p>
                    </div>
                  )}
                  {critical > 0 && (
                    <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                      <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Recouvrement critique</p>
                      <p className="text-sm text-slate-700 mt-1">{critical} dossier{critical > 1 ? 's' : ''} nécessitent une action immédiate</p>
                    </div>
                  )}
                  {notifCount === 0 && (
                    <p className="p-6 text-center text-sm text-slate-400">Aucune notification</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => toast("Centre d'aide bientôt disponible", 'info')}
          className="p-2 text-slate-400 hover:text-darbis-blue hover:bg-darbis-blue/5 rounded-full transition-all"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-slate-200 mx-2"></div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-darbis-gold">
                {roleLabel[currentUser.role] || currentUser.role}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-darbis-blue text-white flex items-center justify-center font-bold ring-2 ring-slate-100">
              {currentUser.name.charAt(0)}
            </div>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20">
                <div className="p-4 border-b border-slate-100">
                  <p className="font-bold text-slate-800 text-sm">{currentUser.name}</p>
                  <p className="text-xs text-slate-500">{currentUser.email}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      toast('Profil bientôt disponible', 'info');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    Mon profil
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      toast('Préférences mises à jour', 'success');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Préférences
                  </button>
                </div>
                <div className="border-t border-slate-100 p-2">
                  <button
                    onClick={() => {
                      logout();
                      toast('Déconnexion réussie', 'info');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
