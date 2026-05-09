import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Calendar,
  PieChart,
  Target
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line
} from 'recharts';
import { formatCurrency } from '../../lib/utils';

const data = [
  { name: 'Jan', facturé: 45000, encaissé: 38000 },
  { name: 'Fév', facturé: 52000, encaissé: 41000 },
  { name: 'Mar', facturé: 48000, encaissé: 45000 },
  { name: 'Avr', facturé: 61000, encaissé: 52000 },
  { name: 'Mai', facturé: 55000, encaissé: 48000 },
  { name: 'Juin', facturé: 72000, encaissé: 61000 },
];

export const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reporting & Analytics</h2>
          <p className="text-slate-500 text-sm">Visualisez la performance financière globale de Bureau Darbis.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
             <Calendar className="w-4 h-4" />
             Période
          </button>
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            PDF Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-card p-6 h-[400px]">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-slate-900">Facturation vs Encaissement</h3>
              <div className="p-2 bg-slate-50 rounded-lg"><PieChart className="w-4 h-4 text-slate-400" /></div>
           </div>
           <ResponsiveContainer width="100%" height="80%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(v: any) => formatCurrency(v)}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="facturé" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="encaissé" fill="#b2945e" radius={[4, 4, 0, 0]} />
              </BarChart>
           </ResponsiveContainer>
        </div>

        <div className="premium-card p-6 h-[400px]">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-slate-900">Évolution DSO (Jours)</h3>
              <div className="p-2 bg-slate-50 rounded-lg"><Target className="w-4 h-4 text-slate-400" /></div>
           </div>
           <ResponsiveContainer width="100%" height="80%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="facturé" stroke="#064e3b" strokeWidth={3} dot={{ r: 4, fill: '#064e3b' }} />
              </LineChart>
           </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Cash Flow Net</p>
           <h3 className="text-2xl font-bold text-darbis-green">+{formatCurrency(125000)}</h3>
           <div className="flex items-center gap-1 text-green-600 text-xs font-bold mt-2">
             <ArrowUpRight className="w-4 h-4" />
             +8% ce mois
           </div>
        </div>
        <div className="premium-card p-6">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Moyenne Facturation</p>
           <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(42000)}</h3>
           <div className="flex items-center gap-1 text-red-600 text-xs font-bold mt-2">
             <ArrowDownRight className="w-4 h-4" />
             -3% ce mois
           </div>
        </div>
        <div className="premium-card p-6">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Efficiency Recouvrement</p>
           <h3 className="text-2xl font-bold text-darbis-gold">88.5%</h3>
           <div className="flex items-center gap-1 text-green-600 text-xs font-bold mt-2">
             <ArrowUpRight className="w-4 h-4" />
             +1.2% ce mois
           </div>
        </div>
      </div>
    </div>
  );
};
