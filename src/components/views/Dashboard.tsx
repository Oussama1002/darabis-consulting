import React from 'react';
import { 
  TrendingUp, 
  Wallet, 
  AlertCircle, 
  BarChart, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingDown,
  Calendar,
  Filter,
  Clock
} from 'lucide-react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { formatCurrency } from '../../lib/utils';
import { mockInvoices, mockClients } from '../../data/mockData';

const data = [
  { name: 'Jan', revenue: 45000, collections: 38000 },
  { name: 'Fév', revenue: 52000, collections: 41000 },
  { name: 'Mar', revenue: 48000, collections: 45000 },
  { name: 'Avr', revenue: 61000, collections: 52000 },
  { name: 'Mai', revenue: 55000, collections: 48000 },
  { name: 'Juin', revenue: 72000, collections: 61000 },
];

const StatCard = ({ title, value, subValue, icon: Icon, trend, color }: any) => (
  <div className="premium-card p-6 flex flex-col justify-between">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Bienvenue, Ahmed</h2>
          <p className="text-slate-500 mt-1">Voici l'état actuel de vos finances pour Bureau Darbis.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            Filtrer
          </button>
          <button className="bg-darbis-green text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-darbis-green-dark transition-all shadow-sm">
            <Calendar className="w-4 h-4" />
            Mai 2024
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Chiffre d'Affaires Total" 
          value={formatCurrency(1245000)} 
          subValue="+12% par rapport au mois dernier"
          icon={TrendingUp} 
          trend={12.5}
          color="darbis-blue"
        />
        <StatCard 
          title="Total Créances" 
          value={formatCurrency(342000)} 
          subValue="24 factures en attente"
          icon={Wallet} 
          trend={-2.4}
          color="darbis-gold"
        />
        <StatCard 
          title="Factures Impayées" 
          value={formatCurrency(125000)} 
          subValue="Dont 45k€ de plus de 30 jours"
          icon={AlertCircle} 
          trend={5.1}
          color="red"
        />
        <StatCard 
          title="Taux de Recouvrement" 
          value="88.4%" 
          subValue="+3.2% ce trimestre"
          icon={BarChart} 
          trend={3.2}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 premium-card p-6 h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-slate-900">Performance de Collection</h3>
              <p className="text-sm text-slate-400">Revenus vs Recouvrements (DH)</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-darbis-blue"></div>
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Facturation</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-darbis-gold"></div>
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Paiements</span>
               </div>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} tickFormatter={(value) => `${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="revenue" stroke="#1e3a8a" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="collections" stroke="#b2945e" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card p-6 overflow-hidden">
          <h3 className="font-bold text-slate-900 mb-6">Clients les plus endettés</h3>
          <div className="space-y-6">
            {mockClients.filter(c => c.balance > 0).sort((a,b) => b.balance - a.balance).map((client) => (
              <div key={client.id} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text- darbis-blue font-bold">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-darbis-blue transition-colors">{client.name}</h4>
                    <p className="text-xs text-slate-400">{client.contactName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">{formatCurrency(client.balance)}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Dette Totale</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 rounded-xl bg-slate-50 text-slate-600 text-sm font-bold hover:bg-slate-100 transition-colors">
            Voir tous les clients
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 premium-card overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Dernières Factures</h3>
            <button className="text-sm font-bold text-darbis-blue hover:underline">Voir tout</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Référence</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Montant</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {mockInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-800 tracking-tight">{inv.invoiceNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-600">{inv.clientName}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{inv.date}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        inv.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-100' : 
                        inv.status === 'OVERDUE' ? 'bg-red-50 text-red-700 border-red-100' : 
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {inv.status === 'PAID' ? 'Payée' : inv.status === 'OVERDUE' ? 'En retard' : 'Partielle'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="premium-card p-6">
          <h3 className="font-bold text-slate-900 mb-6">Actions de Recouvrement</h3>
          <div className="space-y-5">
            {[
              { type: 'Relance Email', client: 'Atlas Industries', date: 'Aujourd\'hui', urgent: true },
              { type: 'Appel Téléphonique', client: 'Société Générale', date: 'Demain', urgent: false },
              { type: 'Mise en demeure', client: 'Maroc Telecom', date: 'Lundi prochain', urgent: false },
            ].map((action, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
                <div className={`w-1 h-10 rounded-full ${action.urgent ? 'bg-red-500' : 'bg-darbis-gold'}`}></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{action.type}</h4>
                  <p className="text-xs text-slate-500">{action.client}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-3 h-3 text-slate-300" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{action.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm font-bold hover:bg-slate-50 hover:text-slate-600 transition-all">
            + Planifier une action
          </button>
        </div>
      </div>
    </div>
  );
};
