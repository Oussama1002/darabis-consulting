import React, { useState } from 'react';
import { Search, Bell, HelpCircle, Mail, LogOut, Settings, User as UserIcon, Menu } from 'lucide-react';
import { useData } from '../../store/DataContext';
import { useToast } from '../ui/Toast';

const roleLabel: Record<string, string> = {
  ADMIN: 'Administrateur',
  ACCOUNTANT: 'Comptable',
  RECOVERY_AGENT: 'Agent Recouvrement',
  FINANCIAL_MANAGER: 'Resp. Financier',
};

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { currentUser, logout, invoices, recoveryCases } = useData();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const overdue = invoices.filter((i) => i.status === 'OVERDUE').length;
  const critical = recoveryCases.filter((r) => r.priority === 'CRITICAL').length;
  const notifCount = overdue + critical;

  if (!currentUser) return null;

  return (
    <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 fixed top-0 left-0 right-0 lg:left-72 z-30 px-3 sm:px-4 md:px-6 lg:px-8 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={onMenuClick}
          className="touch-target lg:hidden shrink-0 rounded-xl text-slate-600 hover:bg-slate-100 active:bg-slate-200 -ml-1"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative flex-1 max-w-xl group min-w-0 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-darbis-blue transition-colors pointer-events-none" />
          <input
            type="search"
            enterKeyHint="search"
            placeholder="Client, facture…"
            className="w-full bg-slate-100/50 border border-transparent focus:border-darbis-blue/30 focus:bg-white rounded-xl py-2.5 pl-10 pr-3 text-sm outline-none transition-all"
          />
        </div>

        <button
          type="button"
          onClick={() => toast('Recherche globale : utilisez le champ sur tablette ou bureau', 'info')}
          className="touch-target sm:hidden shrink-0 rounded-xl text-slate-500 hover:bg-slate-100"
          aria-label="Recherche"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 shrink-0">
        <button
          type="button"
          onClick={() => toast('Aucun nouveau message', 'info')}
          className="hidden sm:flex p-2.5 text-slate-400 hover:text-darbis-blue hover:bg-darbis-blue/5 rounded-full transition-all relative touch-manipulation min-w-[40px] min-h-[40px] items-center justify-center"
          aria-label="Messages"
        >
          <Mail className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-darbis-gold rounded-full border-2 border-white" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((o) => !o)}
            className="p-2.5 text-slate-400 hover:text-darbis-blue hover:bg-darbis-blue/5 rounded-full transition-all relative touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Notifications"
            aria-expanded={notifOpen}
          >
            <Bell className="w-5 h-5" />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center">
                {notifCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} aria-hidden />
              <div className="absolute right-0 mt-2 w-[min(calc(100vw-2rem),20rem)] sm:w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20">
                <div className="p-4 border-b border-slate-100">
                  <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
                </div>
                <div className="max-h-[min(20rem,50vh)] overflow-y-auto overscroll-contain">
                  {overdue > 0 && (
                    <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer active:bg-slate-100">
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Factures en retard</p>
                      <p className="text-sm text-slate-700 mt-1">
                        {overdue} facture{overdue > 1 ? 's' : ''} ont dépassé leur échéance
                      </p>
                    </div>
                  )}
                  {critical > 0 && (
                    <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer active:bg-slate-100">
                      <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Recouvrement critique</p>
                      <p className="text-sm text-slate-700 mt-1">
                        {critical} dossier{critical > 1 ? 's' : ''} nécessitent une action immédiate
                      </p>
                    </div>
                  )}
                  {notifCount === 0 && <p className="p-6 text-center text-sm text-slate-400">Aucune notification</p>}
                </div>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => toast("Centre d'aide bientôt disponible", 'info')}
          className="hidden md:flex p-2.5 text-slate-400 hover:text-darbis-blue hover:bg-darbis-blue/5 rounded-full transition-all touch-manipulation min-w-[40px] min-h-[40px] items-center justify-center"
          aria-label="Aide"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="hidden sm:block w-px h-6 bg-slate-200 mx-0.5" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 pr-1 py-1 rounded-xl hover:bg-slate-50 transition-colors touch-manipulation min-h-[44px]"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <div className="text-right hidden md:block min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate max-w-[140px]">{currentUser.name}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-darbis-gold truncate">
                {roleLabel[currentUser.role] || currentUser.role}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-darbis-blue text-white flex items-center justify-center font-bold ring-2 ring-slate-100 shrink-0 text-sm">
              {currentUser.name.charAt(0)}
            </div>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden />
              <div className="absolute right-0 mt-2 w-[min(calc(100vw-2rem),14rem)] sm:w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20">
                <div className="p-4 border-b border-slate-100 md:hidden">
                  <p className="font-bold text-slate-800 text-sm truncate">{currentUser.name}</p>
                  <p className="text-[10px] font-bold text-darbis-gold uppercase">{roleLabel[currentUser.role]}</p>
                </div>
                <div className="p-4 border-b border-slate-100 hidden md:block">
                  <p className="font-bold text-slate-800 text-sm">{currentUser.name}</p>
                  <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                </div>
                <div className="py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      toast('Profil bientôt disponible', 'info');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px]"
                  >
                    <UserIcon className="w-4 h-4 shrink-0" />
                    Mon profil
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      toast('Préférences mises à jour', 'success');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px]"
                  >
                    <Settings className="w-4 h-4 shrink-0" />
                    Préférences
                  </button>
                </div>
                <div className="border-t border-slate-100 p-2">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      toast('Déconnexion réussie', 'info');
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[44px]"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
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
