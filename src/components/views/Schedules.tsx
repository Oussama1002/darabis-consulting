import React, { useState } from 'react';
import { Clock, Calendar, CheckCircle2, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useData } from '../../store/DataContext';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../ui/ConfirmDialog';
import { Modal, Field, Input, Select, PrimaryButton, SecondaryButton } from '../ui/Modal';
import { formatCurrency, formatDate, cn } from '../../lib/utils';

export const Schedules: React.FC = () => {
  const { schedules, invoices, addSchedule, payInstallment, deleteSchedule } = useData();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    invoiceId: '',
    installmentCount: 3,
    firstDueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  const openInvoices = invoices.filter((i) => i.status !== 'PAID' && i.status !== 'DRAFT');

  const submit = () => {
    const inv = invoices.find((i) => i.id === form.invoiceId);
    if (!inv) return toast('Sélectionnez une facture', 'error');
    if (form.installmentCount < 2) return toast('Minimum 2 échéances', 'error');

    const remaining = inv.totalAmount - inv.paidAmount;
    const baseAmount = Math.floor((remaining / form.installmentCount) * 100) / 100;
    const installments = Array.from({ length: form.installmentCount }, (_, idx) => {
      const date = new Date(form.firstDueDate);
      date.setMonth(date.getMonth() + idx);
      const isLast = idx === form.installmentCount - 1;
      const amount = isLast ? remaining - baseAmount * (form.installmentCount - 1) : baseAmount;
      return {
        id: `inst-${Date.now()}-${idx}`,
        dueDate: date.toISOString().split('T')[0],
        amount,
        status: 'PENDING' as const,
      };
    });

    addSchedule({
      clientId: inv.clientId,
      clientName: inv.clientName,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      totalAmount: remaining,
      remainingAmount: remaining,
      installments,
    });
    toast('Échéancier créé');
    setShowForm(false);
  };

  const handlePay = async (scheduleId: string, installmentId: string, amount: number) => {
    const ok = await confirm({
      title: 'Marquer comme payée ?',
      message: `Confirmer l'encaissement de ${formatCurrency(amount)}.`,
      confirmLabel: 'Payer',
    });
    if (ok) {
      payInstallment(scheduleId, installmentId);
      toast('Échéance payée');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Supprimer cet échéancier ?',
      message: 'Toutes les échéances seront perdues.',
      danger: true,
      confirmLabel: 'Supprimer',
    });
    if (ok) {
      deleteSchedule(id);
      toast('Échéancier supprimé', 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Échéanciers de Paiement</h2>
          <p className="text-slate-500 text-sm">Suivez les plans de paiement échelonnés de vos clients.</p>
        </div>
        <PrimaryButton onClick={() => setShowForm(true)}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" />Créer un échéancier</span>
        </PrimaryButton>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {schedules.length === 0 && (
          <div className="premium-card p-16 text-center">
            <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Aucun échéancier pour le moment</p>
            <button onClick={() => setShowForm(true)} className="mt-4 text-sm font-bold text-darbis-blue hover:underline">
              + Créer le premier
            </button>
          </div>
        )}
        {schedules.map((schedule) => {
          const paidCount = schedule.installments.filter((i) => i.status === 'PAID').length;
          const progress = (paidCount / schedule.installments.length) * 100;
          return (
            <div key={schedule.id} className="premium-card overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900">{schedule.clientName}</h3>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase">
                      {schedule.invoiceNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Total : {formatCurrency(schedule.totalAmount)} • Reste :{' '}
                    <span className={cn('font-bold', schedule.remainingAmount > 0 ? 'text-red-600' : 'text-green-600')}>
                      {formatCurrency(schedule.remainingAmount)}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Progression</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-darbis-blue h-full transition-all" style={{ width: `${progress}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-700">{Math.round(progress)}%</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(schedule.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {schedule.installments.map((inst, idx) => (
                    <div
                      key={inst.id}
                      className={cn(
                        'p-4 rounded-xl border flex flex-col justify-between h-32 relative',
                        inst.status === 'PAID' ? 'bg-green-50/50 border-green-100' :
                        inst.status === 'OVERDUE' ? 'bg-red-50/50 border-red-100' : 'bg-white border-slate-100'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Échéance {idx + 1}</span>
                        {inst.status === 'PAID' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-slate-300" />}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-800">{formatCurrency(inst.amount)}</p>
                        <p className="text-xs text-slate-500">Prévu le : {formatDate(inst.dueDate)}</p>
                      </div>
                      {inst.status === 'PENDING' && (
                        <button
                          onClick={() => handlePay(schedule.id, inst.id, inst.amount)}
                          className="absolute bottom-4 right-4 text-[10px] font-bold text-darbis-blue uppercase hover:underline"
                        >
                          Payer
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Créer un échéancier"
        size="md"
        footer={
          <>
            <SecondaryButton onClick={() => setShowForm(false)}>Annuler</SecondaryButton>
            <PrimaryButton onClick={submit}>Créer</PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Facture concernée *">
            <Select value={form.invoiceId} onChange={(e) => setForm({ ...form, invoiceId: e.target.value })}>
              <option value="">Sélectionner</option>
              {openInvoices.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.invoiceNumber} — {i.clientName} — {formatCurrency(i.totalAmount - i.paidAmount)}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre d'échéances">
              <Input
                type="number"
                min={2}
                max={12}
                value={form.installmentCount}
                onChange={(e) => setForm({ ...form, installmentCount: Number(e.target.value) })}
              />
            </Field>
            <Field label="Première échéance">
              <Input type="date" value={form.firstDueDate} onChange={(e) => setForm({ ...form, firstDueDate: e.target.value })} />
            </Field>
          </div>
          <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
            Les échéances seront réparties à intervalle mensuel à partir de la première date.
          </p>
        </div>
      </Modal>
    </div>
  );
};
