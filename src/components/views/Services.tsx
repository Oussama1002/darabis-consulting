import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Plus,
  Filter,
  Download,
  Edit3,
  Trash2,
  Tag,
  GraduationCap,
  FileSearch,
  HandshakeIcon,
  Layers,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useData } from '../../store/DataContext';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../ui/ConfirmDialog';
import { Modal, Field, Input, Textarea, Select, PrimaryButton, SecondaryButton } from '../ui/Modal';
import { formatCurrency, cn } from '../../lib/utils';
import { Service, ServiceCategory } from '../../types';

const emptyForm = {
  code: '',
  name: '',
  description: '',
  category: 'CONSULTING' as ServiceCategory,
  unitPrice: 0,
  taxRate: 20,
  unit: 'jour',
  active: true,
};

export const Services: React.FC = () => {
  const { services, addService, updateService, deleteService, toggleServiceActive } = useData();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [filter, setFilter] = useState<'ALL' | ServiceCategory>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);

  const categoryMeta: Record<ServiceCategory, { label: string; color: string; icon: any }> = {
    CONSULTING: { label: 'Consulting', color: 'darbis-blue', icon: Briefcase },
    FORMATION: { label: 'Formation', color: 'orange', icon: GraduationCap },
    AUDIT: { label: 'Audit', color: 'purple', icon: FileSearch },
    ACCOMPAGNEMENT: { label: 'Accompagnement', color: 'green', icon: HandshakeIcon },
    AUTRE: { label: 'Autre', color: 'slate', icon: Layers },
  };

  const filtered = services.filter(
    (s) =>
      (filter === 'ALL' || s.category === filter) &&
      (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalActive = services.filter((s) => s.active).length;
  const avgPrice = services.length ? services.reduce((sum, s) => sum + s.unitPrice, 0) / services.length : 0;

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, code: `SRV-${String(services.length + 1).padStart(3, '0')}` });
    setShowForm(true);
  };
  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({ ...s });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast('Code et nom requis', 'error');
      return;
    }
    if (form.unitPrice <= 0) {
      toast('Le prix doit être supérieur à 0', 'error');
      return;
    }
    if (editing) {
      updateService(editing.id, form);
      toast('Service mis à jour');
    } else {
      addService(form);
      toast('Service créé');
    }
    setShowForm(false);
  };

  const handleDelete = async (s: Service) => {
    const ok = await confirm({
      title: 'Supprimer ce service ?',
      message: `Le service "${s.name}" sera retiré du catalogue.`,
      danger: true,
      confirmLabel: 'Supprimer',
    });
    if (ok) {
      deleteService(s.id);
      toast('Service supprimé', 'info');
    }
  };

  const handleExport = () => {
    const csv =
      'Code,Nom,Catégorie,Prix HT,TVA,Unité,Statut\n' +
      services
        .map((s) => `"${s.code}","${s.name}","${s.category}",${s.unitPrice},${s.taxRate},"${s.unit}","${s.active ? 'Actif' : 'Archivé'}"`)
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `services-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Export téléchargé');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Catalogue de Services</h2>
          <p className="text-slate-500 text-sm">Gérez votre portefeuille de prestations et leur tarification.</p>
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
              Nouveau Service
            </span>
          </PrimaryButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="premium-card p-6 border-l-4 border-l-darbis-blue">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Services</p>
          <h3 className="text-3xl font-bold text-slate-900">{services.length}</h3>
          <p className="text-xs text-slate-400 mt-1">{totalActive} actifs</p>
        </div>
        <div className="premium-card p-6 border-l-4 border-l-darbis-green">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Prix Moyen</p>
          <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(avgPrice)}</h3>
          <p className="text-xs text-slate-400 mt-1">Hors taxes</p>
        </div>
        <div className="premium-card p-6 border-l-4 border-l-orange-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Catégories</p>
          <h3 className="text-3xl font-bold text-slate-900">5</h3>
        </div>
        <div className="premium-card p-6 border-l-4 border-l-darbis-gold">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">TVA Standard</p>
          <h3 className="text-3xl font-bold text-slate-900">20%</h3>
        </div>
      </div>

      <div className="premium-card">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:border-darbis-blue/20 transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'CONSULTING', 'FORMATION', 'AUDIT', 'ACCOMPAGNEMENT'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all',
                  filter === cat ? 'bg-darbis-blue text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                )}
              >
                {cat === 'ALL' ? 'Tous' : categoryMeta[cat as ServiceCategory].label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Unité</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">TVA</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Prix HT</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((service) => {
                const meta = categoryMeta[service.category];
                const Icon = meta.icon;
                return (
                  <tr key={service.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{service.code}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{service.name}</h4>
                          <p className="text-xs text-slate-400 max-w-md truncate">{service.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500">/ {service.unit}</td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-600">{service.taxRate}%</td>
                    <td className="px-6 py-5 text-right text-sm font-bold text-slate-900">{formatCurrency(service.unitPrice)}</td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => {
                          toggleServiceActive(service.id);
                          toast(service.active ? 'Service archivé' : 'Service activé');
                        }}
                        className={cn(
                          'inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border cursor-pointer hover:scale-105 transition-transform',
                          service.active
                            ? 'text-green-700 bg-green-50 border-green-100'
                            : 'text-slate-500 bg-slate-50 border-slate-100'
                        )}
                      >
                        {service.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {service.active ? 'Actif' : 'Archivé'}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(service)} className="p-2 text-slate-400 hover:text-darbis-blue hover:bg-darbis-blue/5 rounded-lg">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(service)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-sm text-slate-400">
                    Aucun service trouvé
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
        title={editing ? 'Modifier le service' : 'Nouveau service'}
        size="lg"
        footer={
          <>
            <SecondaryButton onClick={() => setShowForm(false)}>Annuler</SecondaryButton>
            <PrimaryButton onClick={handleSubmit}>{editing ? 'Enregistrer' : 'Créer'}</PrimaryButton>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Code *">
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CON-001" />
          </Field>
          <Field label="Catégorie">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ServiceCategory })}>
              <option value="CONSULTING">Consulting</option>
              <option value="FORMATION">Formation</option>
              <option value="AUDIT">Audit</option>
              <option value="ACCOMPAGNEMENT">Accompagnement</option>
              <option value="AUTRE">Autre</option>
            </Select>
          </Field>
          <div className="col-span-2">
            <Field label="Nom du service *">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Description">
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
          </div>
          <Field label="Prix HT (MAD) *">
            <Input
              type="number"
              value={form.unitPrice}
              onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })}
            />
          </Field>
          <Field label="TVA (%)">
            <Input
              type="number"
              value={form.taxRate}
              onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
            />
          </Field>
          <Field label="Unité">
            <Select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
              <option value="jour">Jour</option>
              <option value="heure">Heure</option>
              <option value="session">Session</option>
              <option value="mission">Mission</option>
              <option value="an">An</option>
              <option value="forfait">Forfait</option>
            </Select>
          </Field>
          <Field label="Statut">
            <Select value={form.active ? '1' : '0'} onChange={(e) => setForm({ ...form, active: e.target.value === '1' })}>
              <option value="1">Actif</option>
              <option value="0">Archivé</option>
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  );
};
