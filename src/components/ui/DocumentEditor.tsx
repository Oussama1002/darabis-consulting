import React, { useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Field, Input, Select } from './Modal';
import { useData } from '../../store/DataContext';
import { InvoiceItem } from '../../types';
import { formatCurrency } from '../../lib/utils';

export interface DocumentFormState {
  clientId: string;
  date: string;
  dueDate: string;
  taxRate: number;
  items: InvoiceItem[];
}

interface Props {
  form: DocumentFormState;
  setForm: (s: DocumentFormState) => void;
  dueDateLabel?: string;
}

let lineCounter = 1;
const newLine = (): InvoiceItem => ({
  id: `line-${++lineCounter}-${Date.now()}`,
  description: '',
  quantity: 1,
  unitPrice: 0,
  total: 0,
});

export const DocumentEditor: React.FC<Props> = ({ form, setForm, dueDateLabel = 'Échéance' }) => {
  const { clients, services } = useData();

  const updateItem = (idx: number, patch: Partial<InvoiceItem>) => {
    const items = form.items.map((it, i) => {
      if (i !== idx) return it;
      const merged = { ...it, ...patch };
      merged.total = merged.quantity * merged.unitPrice;
      return merged;
    });
    setForm({ ...form, items });
  };

  const addLine = () => setForm({ ...form, items: [...form.items, newLine()] });
  const removeLine = (idx: number) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

  const applyService = (idx: number, serviceId: string) => {
    const sv = services.find((s) => s.id === serviceId);
    if (!sv) return;
    updateItem(idx, { description: sv.name, unitPrice: sv.unitPrice });
  };

  const totals = useMemo(() => {
    const subtotal = form.items.reduce((sum, it) => sum + it.total, 0);
    const tax = subtotal * (form.taxRate / 100);
    return { subtotal, tax, total: subtotal + tax };
  }, [form.items, form.taxRate]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Client *">
          <Select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
            <option value="">Sélectionner un client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="TVA (%)">
          <Input
            type="number"
            value={form.taxRate}
            onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
          />
        </Field>
        <Field label="Date">
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </Field>
        <Field label={dueDateLabel}>
          <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </Field>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Lignes</h4>
          <button
            onClick={addLine}
            type="button"
            className="text-xs font-bold text-darbis-blue hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Ajouter une ligne
          </button>
        </div>

        <div className="space-y-2">
          {form.items.length === 0 && (
            <p className="text-xs text-slate-400 italic p-4 bg-slate-50 rounded-lg text-center">
              Aucune ligne. Cliquez sur "Ajouter une ligne".
            </p>
          )}
          {form.items.map((it, idx) => (
            <div key={it.id} className="grid grid-cols-12 gap-2 items-start p-3 bg-slate-50 rounded-lg">
              <div className="col-span-12 md:col-span-5 space-y-1">
                <Select
                  value=""
                  onChange={(e) => e.target.value && applyService(idx, e.target.value)}
                  className="text-xs"
                >
                  <option value="">— Choisir depuis le catalogue —</option>
                  {services
                    .filter((s) => s.active)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} · {s.name}
                      </option>
                    ))}
                </Select>
                <Input
                  placeholder="Description"
                  value={it.description}
                  onChange={(e) => updateItem(idx, { description: e.target.value })}
                />
              </div>
              <div className="col-span-3 md:col-span-2">
                <Input
                  type="number"
                  placeholder="Qté"
                  value={it.quantity}
                  onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <Input
                  type="number"
                  placeholder="Prix HT"
                  value={it.unitPrice}
                  onChange={(e) => updateItem(idx, { unitPrice: Number(e.target.value) })}
                />
              </div>
              <div className="col-span-4 md:col-span-2 px-2 py-2.5 text-sm font-bold text-right text-slate-700">
                {formatCurrency(it.total)}
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeLine(idx)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Sous-total HT</span>
          <span className="font-bold">{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/60">TVA ({form.taxRate}%)</span>
          <span className="font-bold">{formatCurrency(totals.tax)}</span>
        </div>
        <div className="border-t border-white/10 pt-2 flex justify-between">
          <span className="font-bold">Total TTC</span>
          <span className="text-lg font-bold text-darbis-gold">{formatCurrency(totals.total)}</span>
        </div>
      </div>
    </div>
  );
};

export const computeTotals = (items: InvoiceItem[], taxRate: number) => {
  const subtotal = items.reduce((sum, it) => sum + it.total, 0);
  const tax = subtotal * (taxRate / 100);
  return { subtotal, tax, total: subtotal + tax };
};

export const initialDocForm = (): DocumentFormState => {
  const today = new Date().toISOString().split('T')[0];
  const due = new Date();
  due.setDate(due.getDate() + 30);
  return {
    clientId: '',
    date: today,
    dueDate: due.toISOString().split('T')[0],
    taxRate: 20,
    items: [],
  };
};
