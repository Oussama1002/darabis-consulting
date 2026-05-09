import React, { useState } from 'react';
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
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import { useData } from '../../store/DataContext';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../ui/ConfirmDialog';
import { Modal, Field, Input, Select, PrimaryButton, SecondaryButton } from '../ui/Modal';
import { PrintableDocument, printDocument } from '../ui/PrintableDocument';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import { PaymentMethod } from '../../types';

export const Payments: React.FC = () => {
  const { payments, invoices, addPayment, deletePayment } = useData();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [form, setForm] = useState({
    invoiceId: '',
    amount: 0,
    method: 'TRANSFER' as PaymentMethod,
    reference: '',
    date: new Date().toISOString().split('T')[0],
  });

  const openInvoices = invoices.filter((i) => i.status !== 'PAID' && i.status !== 'DRAFT');

  const filteredPayments = payments.filter(
    (p) =>
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
  const overdueAmount = invoices
    .filter((i) => i.status === 'OVERDUE')
    .reduce((s, i) => s + (i.totalAmount - i.paidAmount), 0);

  const openCreate = () => {
    setForm({
      invoiceId: openInvoices[0]?.id || '',
      amount: openInvoices[0] ? openInvoices[0].totalAmount - openInvoices[0].paidAmount : 0,
      method: 'TRANSFER',
      reference: '',
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Encaissements</h2>
          <p className="text-slate-500 text-sm">Suivez et enregistrez les paiements reçus.</p>
        </div>
        <div className="flex gap-3">
          <SecondaryButton onClick={() => toast(`${payments.length} paiements dans l'historique`, 'info')}>
            <span className="flex items-center gap-2"><History className="w-4 h-4" />Historique</span>
          </SecondaryButton>
          <PrimaryButton onClick={openCreate}>
            <span className="flex items-center gap-2"><Plus className="w-4 h-4" />Enregistrer Paiement</span>
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
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Encaissé</p>
              <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(totalCollected)}</h3>
            </div>
          </div>
          <p className="text-xs text-slate-400">{payments.length} paiement{payments.length > 1 ? 's' : ''} enregistré{payments.length > 1 ? 's' : ''}</p>
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
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">À encaisser</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {formatCurrency(invoices.reduce((s, i) => s + (i.totalAmount - i.paidAmount), 0))}
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-400">Toutes factures ouvertes confondues</p>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-900">Historique des Encaissements</h3>
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrer..."
              className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:bg-white"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Facture</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Méthode</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Référence</th>
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
                      {p.method === 'TRANSFER' ? 'Virement' : p.method === 'CASH' ? 'Espèces' : 'Chèque'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">{p.reference || '—'}</td>
                  <td className="px-6 py-4 text-right font-bold text-darbis-green">+{formatCurrency(p.amount)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setReceiptId(p.id)} className="p-2 text-slate-400 hover:text-darbis-blue hover:bg-slate-100 rounded-lg" title="Reçu">
                        <Receipt className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Annuler">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm text-slate-400">Aucun paiement</td>
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
              </Select>
            </Field>
            <Field label="Référence">
              <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="N° chèque, virement..." />
            </Field>
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
              <span className="flex items-center gap-2"><Printer className="w-4 h-4" />Imprimer / PDF</span>
            </PrimaryButton>
          </>
        }
      >
        {receipt && <PrintableDocument type="RECEIPT" document={receipt} />}
      </Modal>
    </div>
  );
};
