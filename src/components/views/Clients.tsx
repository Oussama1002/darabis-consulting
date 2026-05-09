import React, { useState } from 'react';
import {
  Search,
  Download,
  Plus,
  Mail,
  Phone,
  MapPin,
  Filter,
  ArrowUpDown,
  Edit3,
  Trash2,
  Eye,
  X,
} from 'lucide-react';
import { useData } from '../../store/DataContext';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../ui/ConfirmDialog';
import { Modal, Field, Input, Select, PrimaryButton, SecondaryButton } from '../ui/Modal';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import { Client, ClientStatus } from '../../types';

const emptyForm = {
  name: '',
  contactName: '',
  email: '',
  phone: '',
  address: '',
  status: 'ACTIVE' as ClientStatus,
};

export const Clients: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient, invoices, payments } = useData();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ClientStatus>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [detailId, setDetailId] = useState<string | null>(null);

  const filtered = clients.filter(
    (c) =>
      (statusFilter === 'ALL' || c.status === statusFilter) &&
      (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contactName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };
  const openEdit = (c: Client) => {
    setEditing(c);
    setForm({
      name: c.name,
      contactName: c.contactName,
      email: c.email,
      phone: c.phone,
      address: c.address,
      status: c.status,
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast('Nom et email requis', 'error');
      return;
    }
    if (editing) {
      updateClient(editing.id, form);
      toast('Client mis à jour');
    } else {
      addClient(form);
      toast('Client créé avec succès');
    }
    setShowForm(false);
  };

  const handleDelete = async (c: Client) => {
    const ok = await confirm({
      title: 'Supprimer ce client ?',
      message: `Êtes-vous sûr de vouloir supprimer "${c.name}" ? Cette action est irréversible (en démo).`,
      danger: true,
      confirmLabel: 'Supprimer',
    });
    if (ok) {
      deleteClient(c.id);
      toast('Client supprimé', 'info');
    }
  };

  const handleExport = () => {
    const csv =
      'Nom,Contact,Email,Téléphone,Statut,Total facturé,Solde\n' +
      clients
        .map((c) => `"${c.name}","${c.contactName}","${c.email}","${c.phone}","${c.status}",${c.totalInvoiced},${c.balance}`)
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Export CSV téléchargé');
  };

  const detailClient = detailId ? clients.find((c) => c.id === detailId) : null;
  const clientInvoices = detailClient ? invoices.filter((i) => i.clientId === detailClient.id) : [];
  const clientPayments = detailClient ? payments.filter((p) => p.clientId === detailClient.id) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion Clients</h2>
          <p className="text-slate-500 text-sm">
            Gérez votre portefeuille client et suivez leur santé financière en temps réel.
          </p>
        </div>
        <div className="flex gap-3">
          <SecondaryButton onClick={handleExport}>
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </span>
          </SecondaryButton>
          <PrimaryButton onClick={openCreate}>
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouveau Client
            </span>
          </PrimaryButton>
        </div>
      </div>

      <div className="premium-card">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:border-darbis-blue/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['ALL', 'ACTIVE', 'DEBTOR', 'INACTIVE'] as const).map((s) => (
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
                {s === 'ALL' ? 'Tous' : s === 'ACTIVE' ? 'Actifs' : s === 'DEBTOR' ? 'Débiteurs' : 'Inactifs'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Compagnie</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Total Facturé</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Solde</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-darbis-blue/5 flex items-center justify-center text-darbis-blue font-bold shadow-sm">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 tracking-tight">{client.name}</h4>
                        <span className="text-[10px] text-slate-400 font-medium uppercase">{client.address}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">{client.contactName}</span>
                      <span className="text-xs text-slate-400">{client.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                        client.status === 'ACTIVE'
                          ? 'bg-green-50 text-green-700 border-green-100'
                          : client.status === 'DEBTOR'
                          ? 'bg-orange-50 text-orange-700 border-orange-100'
                          : 'bg-slate-50 text-slate-700 border-slate-100'
                      )}
                    >
                      {client.status === 'ACTIVE' ? 'Actif' : client.status === 'DEBTOR' ? 'Débiteur' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                    {formatCurrency(client.totalInvoiced)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className={cn('text-sm font-bold', client.balance > 0 ? 'text-red-600' : 'text-green-600')}>
                      {formatCurrency(client.balance)}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setDetailId(client.id)}
                        className="p-2 text-slate-400 hover:text-darbis-blue hover:bg-darbis-blue/5 rounded-lg"
                        title="Voir fiche"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(client)}
                        className="p-2 text-slate-400 hover:text-darbis-blue hover:bg-darbis-blue/5 rounded-lg"
                        title="Modifier"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-400">
                    Aucun client trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6 border-l-4 border-l-darbis-blue">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Clients</p>
          <h3 className="text-3xl font-bold text-slate-900">{clients.length}</h3>
        </div>
        <div className="premium-card p-6 border-l-4 border-l-orange-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Clients Débiteurs</p>
          <h3 className="text-3xl font-bold text-slate-900">{clients.filter((c) => c.status === 'DEBTOR').length}</h3>
        </div>
        <div className="premium-card p-6 border-l-4 border-l-darbis-green">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Encaissé</p>
          <h3 className="text-2xl font-bold text-slate-900">
            {formatCurrency(clients.reduce((s, c) => s + c.totalPaid, 0))}
          </h3>
        </div>
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Modifier le client' : 'Nouveau client'}
        subtitle={editing ? editing.name : 'Renseignez les coordonnées du client'}
        footer={
          <>
            <SecondaryButton onClick={() => setShowForm(false)}>Annuler</SecondaryButton>
            <PrimaryButton onClick={handleSubmit}>{editing ? 'Enregistrer' : 'Créer'}</PrimaryButton>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Nom de l'entreprise *">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Atlas Industries" />
            </Field>
          </div>
          <Field label="Contact principal">
            <Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="Karim Mansouri" />
          </Field>
          <Field label="Statut">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ClientStatus })}>
              <option value="ACTIVE">Actif</option>
              <option value="DEBTOR">Débiteur</option>
              <option value="INACTIVE">Inactif</option>
            </Select>
          </Field>
          <Field label="Email *">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@entreprise.ma" />
          </Field>
          <Field label="Téléphone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+212 522 ..." />
          </Field>
          <div className="col-span-2">
            <Field label="Adresse">
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Casablanca, Maroc" />
            </Field>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!detailId}
        onClose={() => setDetailId(null)}
        title={detailClient?.name || ''}
        subtitle="Fiche client détaillée"
        size="lg"
      >
        {detailClient && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{detailClient.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{detailClient.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm col-span-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{detailClient.address}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-darbis-blue/5 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total facturé</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(detailClient.totalInvoiced)}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total payé</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(detailClient.totalPaid)}</p>
              </div>
              <div className={cn('p-4 rounded-xl', detailClient.balance > 0 ? 'bg-red-50' : 'bg-slate-50')}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Solde</p>
                <p className={cn('text-lg font-bold mt-1', detailClient.balance > 0 ? 'text-red-600' : 'text-slate-900')}>
                  {formatCurrency(detailClient.balance)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-3">Historique des factures ({clientInvoices.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {clientInvoices.length === 0 && <p className="text-xs text-slate-400">Aucune facture</p>}
                {clientInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm">
                    <div>
                      <span className="font-bold text-slate-700">{inv.invoiceNumber}</span>
                      <span className="text-xs text-slate-400 ml-2">{formatDate(inv.date)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{formatCurrency(inv.totalAmount)}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-white rounded">
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-3">Historique des paiements ({clientPayments.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {clientPayments.length === 0 && <p className="text-xs text-slate-400">Aucun paiement</p>}
                {clientPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg text-sm">
                    <div>
                      <span className="font-bold text-slate-700">{p.invoiceNumber}</span>
                      <span className="text-xs text-slate-400 ml-2">{formatDate(p.date)}</span>
                    </div>
                    <span className="font-bold text-green-700">+{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
