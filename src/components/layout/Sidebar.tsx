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
  ShoppingBag
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useData } from '../../store/DataContext';
import { useToast } from '../ui/Toast';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
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

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const { logout } = useData();
  const { toast } = useToast();
  return (
    <aside className="w-72 h-screen sidebar-gradient text-white flex flex-col fixed left-0 top-0 z-40 lg:translate-x-0 transition-transform duration-300">
      <div className="p-8 flex flex-col items-center border-b border-white/10">
        <div className="w-16 h-16 bg-white rounded-xl mb-4 flex items-center justify-center shadow-lg">
          <span className="text-darbis-green text-3xl font-bold font-serif">DB</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-center">Bureau Darbis</h1>
        <p className="text-xs text-white/60 mt-1 uppercase tracking-widest font-medium">Consulting & Services</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative",
              activeView === item.id 
                ? "bg-white/10 text-white shadow-sm" 
                : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className={cn("w-5 h-5", activeView === item.id ? "text-white" : "text-white/60 group-hover:text-white")} />
            <span className="font-medium text-sm">{item.label}</span>
            {activeView === item.id && (
              <ChevronRight className="w-4 h-4 ml-auto" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-white/10">
        <button
          onClick={() => {
            logout();
            toast('Déconnexion réussie', 'info');
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};
