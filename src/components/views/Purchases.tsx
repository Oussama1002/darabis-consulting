import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Plus,
  Download,
  MoreHorizontal,
  Building2,
  Mail,
  Phone,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Receipt,
  FileText,
  Eye,
} from 'lucide-react';
import { mockExpenses, mockSuppliers } from '../../data/mockData';
import { formatCurrency, formatDate, cn } from '../../lib/utils';

export const Purchases: React.FC = () => {
  const [tab, setTab] = useState<'EXPENSES' | 'SUPPLIERS'>('EXPENSES');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'OVERDUE'>('ALL');

  const filteredExpenses =
    statusFilter === 'ALL'
      ? mockExpenses
      : mockExpenses.filter((e) => e.status === statusFilter);

  const totalSpent = mockExpenses.reduce((sum, e) => sum + e.totalAmount, 0);
  const totalPending = mockExpenses
    .filter((e) => e.status !== 'PAID')
    .reduce((sum, e) => sum + e.totalAmount, 0);
  const overdueCount = mockExpenses.filter((e) => e.status === 'OVERDUE').length;

  const getStatusMeta = (status: string) => {
    switch (status) {
      case 'PAID':
        return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 border-green-100', label: 'Payée' };
      case 'OVERDUE':
        return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-100', label: 'En retard' };
      default:
        return { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100', label: 'En attente' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion des Achats</h2>
          <p className="text-slate-500 text-sm">
            Suivez vos dépenses, fournisseurs et paiements sortants.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Exporter
          </button>
          <button className="bg-darbis-green text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-darbis-green-dark transition-all shadow-sm">
            <Plus className="w-4 h-4" />
            {tab === 'EXPENSES' ? 'Nouvelle Dépense' : 'Nouveau Fournisseur'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="premium-card p-6 border-l-4 border-l-darbis-blue">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Total Dépenses
            </p>
            <TrendingDown className="w-4 h-4 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalSpent)}</h3>
          <p className="text-xs text-slate-400 mt-1">{mockExpenses.length} factures</p>
        </div>
        <div className="premium-card p-6 border-l-4 border-l-orange-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Restant à payer
          </p>
          <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalPending)}</h3>
          <p className="text-xs text-orange-600 font-bold mt-1">
            {mockExpenses.filter((e) => e.status !== 'PAID').length} en attente
          </p>
        </div>
        <div className="premium-card p-6 border-l-4 border-l-red-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            En retard
          </p>
          <h3 className="text-3xl font-bold text-slate-900">{overdueCount}</h3>
          <p className="text-xs text-red-600 font-bold mt-1">À régler en priorité</p>
        </div>
        <div className="premium-card p-6 border-l-4 border-l-darbis-gold">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Fournisseurs
          </p>
          <h3 className="text-3xl font-bold text-slate-900">{mockSuppliers.length}</h3>
          <p className="text-xs text-slate-400 mt-1">Partenaires actifs</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('EXPENSES')}
          className={cn(
            'px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2',
            tab === 'EXPENSES'
              ? 'bg-darbis-blue text-white shadow-sm'
              : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
          )}
        >
          <Receipt className="w-4 h-4" />
          Dépenses
        </button>
        <button
          onClick={() => setTab('SUPPLIERS')}
          className={cn(
            'px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2',
            tab === 'SUPPLIERS'
              ? 'bg-darbis-blue text-white shadow-sm'
              : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
          )}
        >
          <Building2 className="w-4 h-4" />
          Fournisseurs
        </button>
      </div>

      {tab === 'EXPENSES' ? (
        <div className="premium-card">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Référence, fournisseur..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:border-darbis-blue/20 transition-all"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(['ALL', 'PENDING', 'PAID', 'OVERDUE'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all',
                    statusFilter === s
                      ? 'bg-darbis-blue text-white shadow-sm'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  )}
                >
                  {s === 'ALL'
                    ? 'Toutes'
                    : s === 'PENDING'
                    ? 'En attente'
                    : s === 'PAID'
                    ? 'Payées'
                    : 'En retard'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Fournisseur
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Échéance
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                    Total TTC
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredExpenses.map((exp) => {
                  const meta = getStatusMeta(exp.status);
                  const Icon = meta.icon;
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-slate-900">{exp.reference}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-medium text-slate-700">{exp.supplierName}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500">{formatDate(exp.date)}</td>
                      <td className="px-6 py-5 text-sm text-slate-500">{formatDate(exp.dueDate)}</td>
                      <td className="px-6 py-5 text-right font-bold text-slate-900">
                        {formatCurrency(exp.totalAmount)}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                            meta.bg,
                            meta.color
                          )}
                        >
                          <Icon className="w-3 h-3" />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-400 hover:text-darbis-blue hover:bg-slate-100 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-darbis-blue hover:bg-slate-100 rounded-lg">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockSuppliers.map((sup) => (
            <div key={sup.id} className="premium-card p-6 group hover:border-darbis-blue/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-darbis-blue/5 flex items-center justify-center text-darbis-blue font-bold">
                    {sup.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{sup.name}</h3>
                    <p className="text-xs text-slate-400">{sup.category}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{sup.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Phone className="w-3 h-3" />
                  <span>{sup.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Total dépensé
                  </p>
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(sup.totalSpent)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    À régler
                  </p>
                  <p
                    className={cn(
                      'text-sm font-bold',
                      sup.outstanding > 0 ? 'text-orange-600' : 'text-green-600'
                    )}
                  >
                    {formatCurrency(sup.outstanding)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
