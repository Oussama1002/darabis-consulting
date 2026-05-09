import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Clock,
  Bell,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronRight,
  Briefcase,
  Gavel,
  ShoppingBag,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useData } from '../../store/DataContext';
import { useToast } from '../ui/Toast';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'clients', label: 'Gestion Clients', icon: Users },
  { id: 'services', label: 'Catalogue Services', icon: Briefcase },
  { id: 'quotes', label: 'Gestion Devis', icon: FileText },
  { id: 'invoices', label: 'Facturation', icon: FileText },
  { id: 'payments', label: 'Encaissements', icon: CreditCard },
  { id: 'schedules', label: 'Échéanciers', icon: Clock },
  { id: 'reminders', label: 'Relances Automatiques', icon: Bell },
  { id: 'recovery', label: 'Suivi Recouvrement', icon: Gavel },
  { id: 'purchases', label: 'Gestion des Achats', icon: ShoppingBag },
  { id: 'reports', label: 'Reporting & Analytics', icon: BarChart3 },
  { id: 'admin', label: 'Administration', icon: ShieldCheck },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, mobileOpen, onMobileClose }) => {
  const { logout } = useData();
  const { toast } = useToast();

  return (
    <aside
      className={cn(
        'w-[min(20rem,88vw)] lg:w-72 min-h-dvh h-screen sidebar-gradient text-white flex flex-col fixed left-0 top-0 z-40',
        'shadow-2xl lg:shadow-none transition-transform duration-300 ease-out',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      <div className="relative p-6 sm:p-8 flex flex-col items-center border-b border-white/10 shrink-0">
        <button
          type="button"
          onClick={onMobileClose}
          className="touch-target lg:hidden absolute top-4 right-4 rounded-xl text-white/80 hover:bg-white/10 hover:text-white"
          aria-label="Fermer le menu"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl mb-3 sm:mb-4 flex items-center justify-center shadow-lg">
          <span className="text-darbis-green text-2xl sm:text-3xl font-bold font-serif">DB</span>
        </div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-center leading-tight">Bureau Darbis</h1>
        <p className="text-[10px] sm:text-xs text-white/60 mt-1 uppercase tracking-widest font-medium text-center px-2">
          Consulting & Services
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto overscroll-contain py-4 px-3 sm:px-4 space-y-0.5 scrollbar-hide touch-pan-y">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onViewChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 sm:px-4 py-3 min-h-[44px] rounded-xl transition-all duration-200 group relative text-left touch-manipulation',
              activeView === item.id
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-white/60 hover:bg-white/5 hover:text-white active:bg-white/10'
            )}
          >
            <item.icon
              className={cn(
                'w-5 h-5 shrink-0',
                activeView === item.id ? 'text-white' : 'text-white/60 group-hover:text-white'
              )}
            />
            <span className="font-medium text-sm leading-snug">{item.label}</span>
            {activeView === item.id && <ChevronRight className="w-4 h-4 ml-auto shrink-0" />}
          </button>
        ))}
      </nav>

      <div className="p-4 sm:p-6 border-t border-white/10 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => {
            logout();
            toast('Déconnexion réussie', 'info');
            onMobileClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl text-white/60 hover:bg-red-500/10 hover:text-red-400 transition-colors touch-manipulation"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="font-medium text-sm">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};
