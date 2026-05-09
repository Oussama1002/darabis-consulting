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

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'clients': return <Clients />;
      case 'services': return <Services />;
      case 'quotes': return <Quotes />;
      case 'invoices': return <Invoices />;
      case 'payments': return <Payments />;
      case 'schedules': return <Schedules />;
      case 'reminders': return <Reminders />;
      case 'recovery': return <Recovery />;
      case 'purchases': return <Purchases />;
      case 'reports': return <Reports />;
      case 'admin': return <Admin />;
      case 'settings': return <SettingsView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <Navbar />
      <main className="pl-72 pt-20 transition-all duration-300">
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
