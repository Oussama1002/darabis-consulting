import React from 'react';
import { 
  Settings, 
  Building2, 
  FileLock2, 
  BellRing, 
  CreditCard,
  Languages,
  Globe,
  Save
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Paramètres du Système</h2>
          <p className="text-slate-500 text-sm">Configurez l'identité visuelle et les règles métier de Bureau Darbis.</p>
        </div>
        <button className="bg-darbis-blue text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-darbis-blue-dark transition-all shadow-lg active:scale-95">
          <Save className="w-4 h-4" />
          Enregistrer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-1">
           {[
             { label: 'Informations Société', icon: Building2, active: true },
             { label: 'Facturation & Taxes', icon: FileLock2, active: false },
             { label: 'Paiements & RIB', icon: CreditCard, active: false },
             { label: 'Notifications', icon: BellRing, active: false },
             { label: 'Langue & Région', icon: Languages, active: false },
           ].map((item, i) => (
             <button 
               key={i}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                 item.active ? "bg-white text-darbis-blue shadow-sm border border-slate-100" : "text-slate-500 hover:bg-slate-50"
               }`}
             >
               <item.icon className="w-4 h-4" />
               {item.label}
             </button>
           ))}
        </aside>

        <div className="lg:col-span-3 space-y-8">
           <div className="premium-card p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-8 border-b border-slate-50 pb-4">Profil de la Société</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div>
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Dénomination Sociale</label>
                       <input type="text" defaultValue="Bureau Darbis Consulting" className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-darbis-blue/30 transition-all" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Identifiant Fiscal (IF)</label>
                       <input type="text" defaultValue="12345678" className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ice</label>
                       <input type="text" defaultValue="0011223344556677" className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white" />
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    <div>
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Logo Officiel</label>
                       <div className="w-32 h-32 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-200/50 cursor-pointer transition-all">
                          <Globe className="w-8 h-8 mb-2 opacity-20" />
                          <span className="text-[10px] font-bold uppercase">Uploader</span>
                       </div>
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Adresse de Siège</label>
                       <textarea rows={3} defaultValue="Anfa Place, Casablanca, Maroc" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="premium-card p-8 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Préférences Globales</h3>
              <div className="space-y-4">
                 {[
                   { label: 'Activer les rappels auto par défaut', checked: true },
                   { label: 'Inclure le RIB sur les factures PDF', checked: true },
                   { label: 'Notifier l\'administrateur à chaque encaissement', checked: false },
                 ].map((pref, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100">
                      <span className="text-sm font-bold text-slate-700">{pref.label}</span>
                      <div className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${pref.checked ? "bg-darbis-green" : "bg-slate-200"}`}>
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${pref.checked ? "left-7" : "left-1"}`}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
