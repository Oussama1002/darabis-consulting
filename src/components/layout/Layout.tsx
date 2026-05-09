import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { motion, AnimatePresence } from 'motion/react';
import { Dashboard } from '../views/Dashboard';
import { Clients } from '../views/Clients';
import { Invoices } from '../views/Invoices';
import { Payments } from '../views/Payments';
import { Quotes } from '../views/Quotes';
import { Schedules } from '../views/Schedules';
import { Reminders } from '../views/Reminders';
import { Reports } from '../views/Reports';
import { Admin } from '../views/Admin';
import { SettingsView } from '../views/SettingsView';
import { Services } from '../views/Services';
import { Recovery } from '../views/Recovery';
import { Purchases } from '../views/Purchases';

export const Layout: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const goTo = (view: string) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <Clients />;
      case 'services':
        return <Services />;
      case 'quotes':
        return <Quotes />;
      case 'invoices':
        return <Invoices />;
      case 'payments':
        return <Payments />;
      case 'schedules':
        return <Schedules />;
      case 'reminders':
        return <Reminders />;
      case 'recovery':
        return <Recovery />;
      case 'purchases':
        return <Purchases />;
      case 'reports':
        return <Reports />;
      case 'admin':
        return <Admin />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-dvh min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Overlay mobile / tablette : drawer */}
      <button
        type="button"
        aria-label="Fermer le menu"
        className={`fixed inset-0 z-[35] bg-slate-900/50 backdrop-blur-[2px] transition-opacity lg:hidden touch-manipulation ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar activeView={activeView} onViewChange={goTo} mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <main className="relative pt-16 lg:pt-20 pl-0 lg:pl-72 pb-safe transition-[padding] duration-300">
        <div className="px-4 py-5 sm:px-5 sm:py-6 md:px-6 md:py-8 lg:px-8 lg:py-8 max-w-[100vw]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
