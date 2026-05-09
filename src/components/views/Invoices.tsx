import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Download,
  Eye,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Edit3,
  Trash2,
  Printer,
  CreditCard,
} from 'lucide-react';
import { useData } from '../../store/DataContext';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../ui/ConfirmDialog';
import { Modal, Field, Input, Select, PrimaryButton, SecondaryButton } from '../ui/Modal';
import { DocumentEditor, computeTotals, initialDocForm, DocumentFormState } from '../ui/DocumentEditor';
import { PrintableDocument, printDocument } from '../ui/PrintableDocument';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import { Invoice, PaymentMethod } from '../../types';

export const Invoices: React.FC = () => {
  const { invoices, addInvoice, updateInvoice, deleteInvoice, addPayment, clients } = useData();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'OVERDUE' | 'PARTIAL' | 'SENT' | 'DRAFT'>('ALL');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [form, setForm] = useState<DocumentFormState>(initialDocForm());
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);
  const [payForm, setPayForm] = useState({
    amount: 0,
    method: 'TRANSFER' as PaymentMethod,
    reference: '',
    date: new Date().toISOString().split('T')[0],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'OVERDUE': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'PARTIAL': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID': return 'Payée';
      case 'OVERDUE': return 'En retard';
      case 'PARTIAL': return 'Partielle';
      case 'SENT': return 'Envoyée';
      case 'DRAFT': return 'Brouillon';
      default: return status;
    }
  };

  const filtered = invoices.filter(
    (i) =>
      (filter === 'ALL' || i.status === filter) &&
      (i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        i.clientName.toLowerCase().includes(search.toLowerCase()))
  );

  const openCreate = () => {
    setEditing(null);
    setForm(initialDocForm());
    setShowForm(true);
  };

  const openEdit = (inv: Invoice) => {
    setEditing(inv);
    setForm({
      clientId: inv.clientId,
      date: inv.date,
      dueDate: inv.dueDate,
      taxRate: inv.amount > 0 ? Math.round((inv.taxAmount / inv.amount) * 100) : 20,
      items: inv.items,
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.clientId) return toast('Sélectionnez un client', 'error');
    if (form.items.length === 0) return toast('Ajoutez au moins une ligne', 'error');
    const client = clients.find((c) => c.id === form.clientId);
    if (!client) return;
    const totals = computeTotals(form.items, form.taxRate);

    if (editing) {
      updateInvoice(editing.id, {
        clientId: form.clientId,
        clientName: client.name,
        date: form.date,
        dueDate: form.dueDate,
        amount: totals.subtotal,
        taxAmount: totals.tax,
        totalAmount: totals.total,
        items: form.items,
      });
      toast('Facture mise à jour');
    } else {
      addInvoice({
        clientId: form.clientId,
        clientName: client.name,
        date: form.date,
        dueDate: form.dueDate,
        amount: totals.subtotal,
        taxAmount: totals.tax,
        totalAmount: totals.total,
        status: 'DRAFT',
        items: form.items,
      });
      toast('Facture créée');
    }
    setShowForm(false);
  };

  const handleDelete = async (inv: Invoice) => {
    const ok = await confirm({
      title: 'Supprimer cette facture ?',
      message: `La facture ${inv.invoiceNumber} sera supprimée.`,
      danger: true,
      confirmLabel: 'Supprimer',
    });
    if (ok) {
      deleteInvoice(inv.id);
      toast('Facture supprimée', 'info');
    }
  };

  const handleSend = (inv: Invoice) => {
    updateInvoice(inv.id, { status: 'SENT' });
    toast(`Facture ${inv.invoiceNumber} envoyée`);
  };

  const openPayment = (inv: Invoice) => {
    setPayInvoice(inv);
    setPayForm({
      amount: inv.totalAmount - inv.paidAmount,
      method: 'TRANSFER',
      reference: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const submitPayment = () => {
    if (!payInvoice) return;
    if (payForm.amount <= 0) return toast('Montant invalide', 'error');
    if (payForm.amount > payInvoice.totalAmount - payInvoice.paidAmount + 0.01) {
      return toast('Le montant dépasse le reste à payer', 'error');
    }
    addPayment({
      invoiceId: payInvoice.id,
      invoiceNumber: payInvoice.invoiceNumber,
      clientId: payInvoice.clientId,
      clientName: payInvoice.clientName,
      date: payForm.date,
      amount: payForm.amount,
      method: payForm.method,
      reference: payForm.reference || undefined,
    });
    toast('Paiement enregistré');
    setPayInvoice(null);
  };

  const previewInv = previewId ? invoices.find((i) => i.id === previewId) : null;

  const counts = {
    ALL: invoices.length,
    PAID: invoices.filter((i) => i.status === 'PAID').length,
    OVERDUE: invoices.filter((i) => i.status === 'OVERDUE').length,
    PARTIAL: invoices.filter((i) => i.status === 'PARTIAL').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Facturation</h2>
          <p className="text-slate-500 text-sm">Gérez vos factures et suivez les échéances de paiement.</p>
        </div>
        <div className="flex gap-3">
          <PrimaryButton onClick={openCreate}>
            <span className="flex items-center gap-2"><Plus className="w-4 h-4" />Nouvelle Facture</span>
          </PrimaryButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(['ALL', 'PAID', 'OVERDUE', 'PARTIAL'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              'flex flex-col items-start p-4 rounded-2xl transition-all border text-left',
              filter === tab
                ? 'bg-white border-darbis-blue shadow-sm ring-4 ring-darbis-blue/5'
                : 'bg-white border-slate-100 hover:border-slate-200 text-slate-500'
            )}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest mb-1">
              {tab === 'ALL' ? 'Toutes' : getStatusLabel(tab)}
            </span>
            <div className="flex items-center justify-between w-full">
              <span className={cn('text-xl font-bold', filter === tab ? 'text-slate-900' : 'text-slate-400')}>
                {counts[tab]}
              </span>
              {filter === tab && <div className="w-2 h-2 rounded-full bg-darbis-blue"></div>}
            </div>
          </button>
        ))}
      </div>

      <div className="premium-card">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Facture #, Client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:border-darbis-blue/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Référence</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Émission</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Total TTC</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Reste</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-darbis-blue/5 rounded-lg text-darbis-blue">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-900">{inv.invoiceNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium text-slate-700">{inv.clientName}</span>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500">{formatDate(inv.date)}</td>
                  <td className="px-6 py-5 font-bold text-slate-900">{formatCurrency(inv.totalAmount)}</td>
                  <td className="px-6 py-5">
                    <span className={cn('text-sm font-bold', (inv.totalAmount - inv.paidAmount) > 0 ? 'text-orange-600' : 'text-green-600')}>
                      {formatCurrency(inv.totalAmount - inv.paidAmount)}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(inv.status)}
                      <span className={cn('text-[10px] font-bold uppercase tracking-wider',
                        inv.status === 'PAID' ? 'text-green-600' :
                        inv.status === 'OVERDUE' ? 'text-red-600' :
                        inv.status === 'PARTIAL' ? 'text-blue-600' : 'text-slate-500'
                      )}>
                        {getStatusLabel(inv.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setPreviewId(inv.id)} className="p-2 text-slate-400 hover:text-darbis-blue hover:bg-slate-100 rounded-lg" title="Aperçu PDF">
                        <Eye className="w-4 h-4" />
                      </button>
                      {inv.status === 'DRAFT' && (
                        <button onClick={() => handleSend(inv)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Envoyer">
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      {inv.status !== 'PAID' && (
                        <button onClick={() => openPayment(inv)} className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Encaisser">
                          <CreditCard className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => openEdit(inv)} className="p-2 text-slate-400 hover:text-darbis-blue hover:bg-slate-100 rounded-lg" title="Modifier">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(inv)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm text-slate-400">
                    Aucune facture trouvée
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
        title={editing ? 'Modifier la facture' : 'Nouvelle facture'}
        subtitle={editing?.invoiceNumber}
        size="xl"
        footer={
          <>
            <SecondaryButton onClick={() => setShowForm(false)}>Annuler</SecondaryButton>
            <PrimaryButton onClick={handleSubmit}>{editing ? 'Enregistrer' : 'Créer la facture'}</PrimaryButton>
          </>
        }
      >
        <DocumentEditor form={form} setForm={setForm} dueDateLabel="Date d'échéance" />
      </Modal>

      <Modal
        open={!!previewId}
        onClose={() => setPreviewId(null)}
        title="Aperçu de la facture"
        size="xl"
        footer={
          <>
            <SecondaryButton onClick={() => setPreviewId(null)}>Fermer</SecondaryButton>
            <PrimaryButton onClick={printDocument}>
              <span className="flex items-center gap-2"><Printer className="w-4 h-4" />Imprimer / PDF</span>
            </PrimaryButton>
          </>
        }
      >
        {previewInv && <PrintableDocument type="INVOICE" document={previewInv} />}
      </Modal>

      <Modal
        open={!!payInvoice}
        onClose={() => setPayInvoice(null)}
        title="Enregistrer un paiement"
        subtitle={payInvoice ? `Facture ${payInvoice.invoiceNumber} — ${payInvoice.clientName}` : ''}
        footer={
          <>
            <SecondaryButton onClick={() => setPayInvoice(null)}>Annuler</SecondaryButton>
            <PrimaryButton onClick={submitPayment}>Enregistrer</PrimaryButton>
          </>
        }
      >
        {payInvoice && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500">Total TTC</p>
                <p className="text-lg font-bold">{formatCurrency(payInvoice.totalAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Déjà payé</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(payInvoice.paidAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Reste à payer</p>
                <p className="text-lg font-bold text-orange-600">
                  {formatCurrency(payInvoice.totalAmount - payInvoice.paidAmount)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Montant *">
                <Input type="number" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })} />
              </Field>
              <Field label="Date">
                <Input type="date" value={payForm.date} onChange={(e) => setPayForm({ ...payForm, date: e.target.value })} />
              </Field>
              <Field label="Méthode">
                <Select value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value as PaymentMethod })}>
                  <option value="TRANSFER">Virement</option>
                  <option value="CASH">Espèces</option>
                  <option value="CHECK">Chèque</option>
                  <option value="CARD">Carte bancaire</option>
                  <option value="OTHER">Autre</option>
                </Select>
              </Field>
              <Field label="Référence">
                <Input value={payForm.reference} onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })} placeholder="N° chèque, virement..." />
              </Field>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
