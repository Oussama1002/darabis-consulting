import React, { useState } from 'react';
import {
  Gavel,
  AlertTriangle,
  Flame,
  TrendingUp,
  Clock,
  User,
  FileText,
  StickyNote,
  ArrowRight,
  Filter,
  Phone,
  Mail,
  PhoneCall,
  Send,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { mockRecoveryCases } from '../../data/mockData';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import { RecoveryPriority } from '../../types';

export const Recovery: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(mockRecoveryCases[0]?.id || '');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | RecoveryPriority>('ALL');

  const priorityMeta: Record<RecoveryPriority, { label: string; color: string; bg: string }> = {
    LOW: { label: 'Basse', color: 'text-slate-600', bg: 'bg-slate-100' },
    MEDIUM: { label: 'Moyenne', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-100' },
    HIGH: { label: 'Élevée', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-100' },
    CRITICAL: { label: 'Critique', color: 'text-red-700', bg: 'bg-red-50 border-red-100' },
  };

  const filtered =
    priorityFilter === 'ALL'
      ? mockRecoveryCases
      : mockRecoveryCases.filter((c) => c.priority === priorityFilter);

  const selected = mockRecoveryCases.find((c) => c.id === selectedId) || mockRecoveryCases[0];

  const totalDue = mockRecoveryCases.reduce((sum, c) => sum + c.amountDue, 0);
  const critical = mockRecoveryCases.filter((c) => c.priority === 'CRITICAL').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Suivi du Recouvrement</h2>
          <p className="text-slate-500 text-sm">
            Gérez les dossiers de recouvrement et priorisez vos actions.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            Filtres avancés
          </button>
          <button className="bg-darbis-green text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-darbis-green-dark transition-all shadow-sm">
            <Plus className="w-4 h-4" />
            Nouveau dossier
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="premium-card p-6 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Total à recouvrer
            </p>
            <Flame className="w-4 h-4 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalDue)}</h3>
          <p className="text-xs text-slate-400 mt-1">{mockRecoveryCases.length} dossiers actifs</p>
        </div>
        <div className="premium-card p-6 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Dossiers Critiques
            </p>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900">{critical}</h3>
          <p className="text-xs text-red-600 font-bold mt-1">Action immédiate requise</p>
        </div>
        <div className="premium-card p-6 border-l-4 border-l-darbis-blue">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Taux de Recouvrement
            </p>
            <TrendingUp className="w-4 h-4 text-darbis-blue" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900">88.4%</h3>
          <p className="text-xs text-green-600 font-bold mt-1">+3.2% vs trimestre précédent</p>
        </div>
        <div className="premium-card p-6 border-l-4 border-l-darbis-gold">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              DSO Moyen
            </p>
            <Clock className="w-4 h-4 text-darbis-gold" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900">42j</h3>
          <p className="text-xs text-slate-400 mt-1">Objectif: 30j</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 premium-card overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-2">
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all',
                  priorityFilter === p
                    ? 'bg-darbis-blue text-white shadow-sm'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                )}
              >
                {p === 'ALL' ? 'Tous' : priorityMeta[p as RecoveryPriority].label}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Priorité
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Client / Facture
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Retard
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Agent
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      'cursor-pointer transition-colors',
                      selectedId === c.id ? 'bg-darbis-blue/5' : 'hover:bg-slate-50/50'
                    )}
                  >
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                          priorityMeta[c.priority].bg,
                          priorityMeta[c.priority].color
                        )}
                      >
                        {priorityMeta[c.priority].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <h4 className="text-sm font-bold text-slate-800">{c.clientName}</h4>
                      <p className="text-xs text-slate-400">{c.invoiceNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-red-600">
                        {formatCurrency(c.amountDue)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'text-xs font-bold',
                          c.daysOverdue > 30 ? 'text-red-600' : 'text-orange-600'
                        )}
                      >
                        {c.daysOverdue}j
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {c.assignedTo.charAt(0)}
                        </div>
                        <span className="text-xs text-slate-500">{c.assignedTo}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selected && (
            <div className="premium-card overflow-hidden">
              <div className="p-6 bg-darbis-blue text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Gavel className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                    Dossier #{selected.id.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-bold">{selected.clientName}</h3>
                <p className="text-xs text-white/60 mt-1">{selected.invoiceNumber}</p>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">
                      Montant dû
                    </p>
                    <p className="text-2xl font-bold">{formatCurrency(selected.amountDue)}</p>
                  </div>
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                      selected.priority === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-200'
                        : 'bg-white/10 text-white'
                    )}
                  >
                    {priorityMeta[selected.priority].label}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 text-sm">
                  <User className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Agent assigné
                    </p>
                    <p className="font-semibold text-slate-700">{selected.assignedTo}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Dernière action
                    </p>
                    <p className="font-semibold text-slate-700">{selected.lastAction}</p>
                    <p className="text-xs text-slate-400">{formatDate(selected.lastActionDate)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <ArrowRight className="w-4 h-4 text-darbis-blue mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Prochaine action
                    </p>
                    <p className="font-semibold text-darbis-blue">{selected.nextAction}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <StickyNote className="w-4 h-4 text-darbis-gold" />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Notes internes
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{selected.notes}</p>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2">
                  <button className="flex flex-col items-center gap-1 p-3 bg-slate-50 hover:bg-darbis-blue/5 rounded-xl text-slate-600 hover:text-darbis-blue transition-all group">
                    <Mail className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase">Email</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 p-3 bg-slate-50 hover:bg-darbis-blue/5 rounded-xl text-slate-600 hover:text-darbis-blue transition-all">
                    <PhoneCall className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase">Appel</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 p-3 bg-slate-50 hover:bg-darbis-blue/5 rounded-xl text-slate-600 hover:text-darbis-blue transition-all">
                    <Send className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase">SMS</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 p-3 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition-all">
                    <FileText className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase">Mise dem.</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
