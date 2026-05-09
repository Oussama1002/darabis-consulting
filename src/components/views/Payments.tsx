import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Clock,
  History,
  Calendar,
  DollarSign,
  Download,
  Receipt,
  Printer,
  Trash2,
  TrendingUp,
  ArrowUpDown,
  BarChart3,
} from 'lucide-react';
import { useData } from '../../store/DataContext';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../ui/ConfirmDialog';
import { Modal, Field, Input, Select, PrimaryButton, SecondaryButton } from '../ui/Modal';
import { PrintableDocument, printDocument } from '../ui/PrintableDocument';
import {
  formatCurrency,
  formatDate,
  cn,
  paymentMethodLabel,
  parseLocalDate,
  startOfMonth,
  endOfMonth,
} from '../../lib/utils';
import { Payment, PaymentMethod } from '../../types';

type PeriodPreset = 'all' | 'month' | 'quarter' | 'year';
type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

function paymentInPeriod(dateStr: string, preset: PeriodPreset): boolean {
  if (preset === 'all') return true;
  const d = parseLocalDate(dateStr);
  const now = new Date();
  if (preset === 'month') {
    return d >= startOfMonth(now) && d <= endOfMonth(now);
  }
  if (preset === 'year') {
    return d.getFullYear() === now.getFullYear();
  }
  const q = Math.floor(now.getMonth() / 3);
  const start = new Date(now.getFullYear(), q * 3, 1);
  const end = new Date(now.getFullYear(), q * 3 + 3, 0);
  end.setHours(23, 59, 59, 999);
  return d >= start && d <= end;
}

function exportPaymentsCsv(rows: Payment[], filename: string) {
  const header = ['Date', 'Client', 'Facture', 'Méthode', 'Référence', 'Montant (MAD)', 'Notes', 'Échéancier'];
  const lines = rows.map((p) => [
    p.date,
    `"${(p.clientName || '').replace(/"/g, '""')}"`,
    p.invoiceNumber,
    paymentMethodLabel(p.method),
    (p.reference || '').replace(/"/g, '""'),
    String(p.amount),
    `"${(p.notes || '').replace(/"/g, '""')}"`,
    p.scheduleId ? `oui (${p.installmentId || ''})` : 'non',
  ]);
  const csv = [header.join(';'), ...lines.map((l) => l.join(';'))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const Payments: React.FC = () => {
  const { payments, invoices, addPayment, deletePayment } = useData();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodPreset>('all');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'ALL'>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('date-desc');
  const [form, setForm] = useState({
    invoiceId: '',
    amount: 0,
    method: 'TRANSFER' as PaymentMethod,
    reference: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  const openInvoices = invoices.filter((i) => i.status !== 'PAID' && i.status !== 'DRAFT');

  const filteredPayments = useMemo(() => {
    let list = payments.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.clientName.toLowerCase().includes(q) ||
        p.invoiceNumber.toLowerCase().includes(q) ||
        (p.reference && p.reference.toLowerCase().includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q));
      const matchPeriod = paymentInPeriod(p.date, period);
      const matchMethod = methodFilter === 'ALL' || p.method === methodFilter;
      return matchSearch && matchPeriod && matchMethod;
    });
    list = [...list].sort((a, b) => {
      if (sortKey === 'date-desc') return b.date.localeCompare(a.date);
      if (sortKey === 'date-asc') return a.date.localeCompare(b.date);
      if (sortKey === 'amount-desc') return b.amount - a.amount;
      return a.amount - b.amount;
    });
    return list;
  }, [payments, search, period, methodFilter, sortKey]);

  const stats = useMemo(() => {
    const total = filteredPayments.reduce((s, p) => s + p.amount, 0);
    const byMethod = filteredPayments.reduce<Partial<Record<PaymentMethod, number>>>((acc, p) => {
      acc[p.method] = (acc[p.method] || 0) + p.amount;
      return acc;
    }, {});
    const byMonth = filteredPayments.reduce<Record<string, number>>((acc, p) => {
      const key = p.date.slice(0, 7);
      acc[key] = (acc[key] || 0) + p.amount;
      return acc;
    }, {});
    const monthKeys = Object.keys(byMonth).sort().slice(-6);
    const topClients = Object.entries(
      filteredPayments.reduce<Record<string, number>>((acc, p) => {
        acc[p.clientName] = (acc[p.clientName] || 0) + p.amount;
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    return { total, byMethod, byMonth, monthKeys, topClients };
  }, [filteredPayments]);

  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
  const overdueAmount = invoices
    .filter((i) => i.status === 'OVERDUE')
    .reduce((s, i) => s + (i.totalAmount - i.paidAmount), 0);
  const toCollect = invoices.reduce((s, i) => s + (i.totalAmount - i.paidAmount), 0);

  const openCreate = () => {
    setForm({
      invoiceId: openInvoices[0]?.id || '',
      amount: openInvoices[0] ? openInvoices[0].totalAmount - openInvoices[0].paidAmount : 0,
      method: 'TRANSFER',
      reference: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowForm(true);
  };

  const submit = () => {
    const inv = invoices.find((i) => i.id === form.invoiceId);
    if (!inv) return toast('Facture introuvable', 'error');
    if (form.amount <= 0) return toast('Montant invalide', 'error');
    if (form.amount > inv.totalAmount - inv.paidAmount + 0.01) {
      return toast('Le montant dépasse le reste à payer', 'error');
    }
    const payment = addPayment({
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientId: inv.clientId,
      clientName: inv.clientName,
      date: form.date,
      amount: form.amount,
      method: form.method,
      reference: form.reference || undefined,
      notes: form.notes || undefined,
    });
    toast('Paiement enregistré');
    setShowForm(false);
    setReceiptId(payment.id);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Annuler ce paiement ?',
      message: 'Le paiement sera retiré et le solde de la facture mis à jour.',
      danger: true,
      confirmLabel: 'Annuler le paiement',
    });
    if (ok) {
      deletePayment(id);
      toast('Paiement annulé', 'info');
    }
  };

  const onSelectInvoice = (id: string) => {
    const inv = invoices.find((i) => i.id === id);
    setForm((f) => ({ ...f, invoiceId: id, amount: inv ? inv.totalAmount - inv.paidAmount : 0 }));
  };

  const receipt = receiptId ? payments.find((p) => p.id === receiptId) : null;

  const methodMax = Math.max(...(Object.values(stats.byMethod) as number[]), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Encaissements</h2>
          <p className="text-slate-500 text-sm">Suivi complet des paiements, filtres, export et répartition par mode.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <SecondaryButton onClick={() => setShowHistory(true)}>
            <span className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Historique &amp; analyses
            </span>
          </SecondaryButton>
          <SecondaryButton
            onClick={() => exportPaymentsCsv(filteredPayments, `encaissements_${new Date().toISOString().slice(0, 10)}.csv`)}
          >
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </span>
          </SecondaryButton>
          <PrimaryButton onClick={openCreate}>
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Enregistrer paiement
            </span>
          </PrimaryButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6 border-b-4 border-b-green-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total encaissé (tout temps)</p>
              <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(totalCollected)}</h3>
            </div>
          </div>
          <p className="text-xs text-slate-400">{payments.length} paiement{payments.length > 1 ? 's' : ''} en base</p>
        </div>

        <div className="premium-card p-6 border-b-4 border-b-red-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-50 rounded-xl text-red-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Factures en retard</p>
              <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(overdueAmount)}</h3>
            </div>
          </div>
          <p className="text-xs text-slate-400">{invoices.filter((i) => i.status === 'OVERDUE').length} factures concernées</p>
        </div>

        <div className="premium-card p-6 border-b-4 border-b-darbis-blue">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-darbis-blue/5 rounded-xl text-darbis-blue">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reste à encaisser</p>
              <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(toCollect)}</h3>
            </div>
          </div>
          <p className="text-xs text-slate-400">Somme des soldes ouverts sur factures</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-darbis-blue" />
            <h3 className="font-bold text-slate-900">Répartition par mode (filtre actif)</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">{formatCurrency(stats.total)} sur la sélection</p>
          <div className="space-y-3">
            {(['TRANSFER', 'CASH', 'CHECK', 'CARD', 'OTHER'] as PaymentMethod[]).map((m) => {
              const v = stats.byMethod[m] || 0;
              const pct = stats.total > 0 ? Math.round((v / stats.total) * 100) : 0;
              return (
                <div key={m}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{paymentMethodLabel(m)}</span>
                    <span className="text-slate-500">
                      {formatCurrency(v)} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-darbis-blue rounded-full transition-all" style={{ width: `${(v / methodMax) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-darbis-green" />
            <h3 className="font-bold text-slate-900">Top clients (filtre actif)</h3>
          </div>
          <ul className="space-y-3">
            {stats.topClients.length === 0 && <li className="text-sm text-slate-400">Aucune donnée</li>}
            {stats.topClients.map(([name, amt], i) => (
              <li key={name} className="flex justify-between items-center text-sm">
                <span className="text-slate-600">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-[10px] font-bold mr-2">
                    {i + 1}
                  </span>
                  {name}
                </span>
                <span className="font-bold text-slate-800">{formatCurrency(amt)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-bold text-slate-900">Journal des encaissements</h3>
            <div className="relative max-w-xs flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Client, facture, réf., notes..."
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:bg-white"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Période</span>
            {(
              [
                ['all', 'Tout'],
                ['month', 'Ce mois'],
                ['quarter', 'Ce trimestre'],
                ['year', 'Cette année'],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setPeriod(k)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors',
                  period === k ? 'bg-darbis-blue text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {label}
              </button>
            ))}
            <span className="text-xs font-bold text-slate-400 uppercase ml-2">Mode</span>
            <Select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | 'ALL')}
              className="w-40 py-1.5 text-xs"
            >
              <option value="ALL">Tous</option>
              {(Object.keys({ TRANSFER: 1, CASH: 1, CHECK: 1, CARD: 1, OTHER: 1 }) as PaymentMethod[]).map((m) => (
                <option key={m} value={m}>
                  {paymentMethodLabel(m)}
                </option>
              ))}
            </Select>
            <span className="text-xs font-bold text-slate-400 uppercase ml-2 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" /> Tri
            </span>
            <Select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="w-44 py-1.5 text-xs">
              <option value="date-desc">Date ↓</option>
              <option value="date-asc">Date ↑</option>
              <option value="amount-desc">Montant ↓</option>
              <option value="amount-asc">Montant ↑</option>
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Facture</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Mode</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Référence</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Éch.</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Montant</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDate(p.date)}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-800">{p.clientName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-600">{p.invoiceNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wide">
                      {paymentMethodLabel(p.method)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 max-w-[140px] truncate" title={p.reference}>
                    {p.reference || '—'}
                  </td>
                  <td className="px-6 py-4 text-xs">{p.scheduleId ? <span className="text-darbis-blue font-bold">Oui</span> : '—'}</td>
                  <td className="px-6 py-4 text-right font-bold text-darbis-green">+{formatCurrency(p.amount)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setReceiptId(p.id)}
                        className="p-2 text-slate-400 hover:text-darbis-blue hover:bg-slate-100 rounded-lg"
                        title="Reçu"
                        type="button"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Annuler"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-sm text-slate-400">
                    Aucun paiement pour ces critères
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Enregistrer un paiement"
        size="md"
        footer={
          <>
            <SecondaryButton onClick={() => setShowForm(false)}>Annuler</SecondaryButton>
            <PrimaryButton onClick={submit}>Enregistrer</PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Facture *">
            <Select value={form.invoiceId} onChange={(e) => onSelectInvoice(e.target.value)}>
              <option value="">Sélectionner une facture</option>
              {openInvoices.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.invoiceNumber} — {i.clientName} — Reste {formatCurrency(i.totalAmount - i.paidAmount)}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Montant *">
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            </Field>
            <Field label="Date">
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
            <Field label="Méthode">
              <Select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value as PaymentMethod })}>
                <option value="TRANSFER">Virement</option>
                <option value="CASH">Espèces</option>
                <option value="CHECK">Chèque</option>
                <option value="CARD">Carte bancaire</option>
                <option value="OTHER">Autre</option>
              </Select>
            </Field>
            <Field label="Référence">
              <Input
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                placeholder="N° chèque, virement..."
              />
            </Field>
          </div>
          <Field label="Notes internes">
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Commentaire optionnel (visible sur le reçu)" />
          </Field>
        </div>
      </Modal>

      <Modal
        open={showHistory}
        onClose={() => setShowHistory(false)}
        title="Historique & analyses"
        size="xl"
        footer={
          <>
            <SecondaryButton onClick={() => setShowHistory(false)}>Fermer</SecondaryButton>
            <PrimaryButton onClick={() => exportPaymentsCsv(filteredPayments, `export_encaissements.csv`)}>
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exporter la sélection
              </span>
            </PrimaryButton>
          </>
        }
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-600">
            Les graphiques et totaux utilisent les <strong>mêmes filtres</strong> que le tableau principal (période, mode, recherche, tri).
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Volume filtré</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(stats.total)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Opérations</p>
              <p className="text-xl font-bold text-slate-900">{filteredPayments.length}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Moyenne</p>
              <p className="text-xl font-bold text-slate-900">
                {filteredPayments.length ? formatCurrency(stats.total / filteredPayments.length) : '—'}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Mois (YYYY-MM)</p>
              <p className="text-sm font-bold text-slate-700">{stats.monthKeys.slice(-1)[0] || '—'}</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-2">Encaissements par mois (6 derniers mois présents)</h4>
            {stats.monthKeys.length === 0 ? (
              <p className="text-sm text-slate-400 py-8">Ajustez les filtres pour voir la répartition mensuelle.</p>
            ) : (
              <div className="flex items-end gap-2 h-36">
                {stats.monthKeys.map((key) => {
                  const v = stats.byMonth[key] || 0;
                  const maxM = Math.max(...stats.monthKeys.map((k) => stats.byMonth[k] || 0), 1);
                  const pct = (v / maxM) * 100;
                  return (
                    <div key={key} className="flex-1 flex flex-col items-center gap-1 min-w-0 h-full justify-end">
                      <span className="text-[10px] font-medium text-slate-600">{formatCurrency(v)}</span>
                      <div className="w-full bg-slate-100 rounded-t-lg flex-1 flex items-end min-h-[24px] max-h-[120px]">
                        <div className="w-full bg-darbis-green/80 rounded-t-lg transition-all" style={{ height: `${Math.max(pct, 2)}%` }} />
                      </div>
                      <span className="text-[9px] text-slate-500 truncate w-full text-center">{key}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={!!receiptId}
        onClose={() => setReceiptId(null)}
        title="Reçu de paiement"
        size="xl"
        footer={
          <>
            <SecondaryButton onClick={() => setReceiptId(null)}>Fermer</SecondaryButton>
            <PrimaryButton onClick={printDocument}>
              <span className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Imprimer / PDF
              </span>
            </PrimaryButton>
          </>
        }
      >
        {receipt && <PrintableDocument type="RECEIPT" document={receipt} />}
      </Modal>
    </div>
  );
};
