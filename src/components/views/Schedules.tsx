import React, { useMemo, useState } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  Plus,
  Trash2,
  ListOrdered,
  AlertTriangle,
  Download,
  ChevronDown,
} from 'lucide-react';
import { useData } from '../../store/DataContext';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../ui/ConfirmDialog';
import { Modal, Field, Input, Select, PrimaryButton, SecondaryButton } from '../ui/Modal';
import { formatCurrency, formatDate, cn, installmentEffectiveStatus, parseLocalDate } from '../../lib/utils';
import { PaymentMethod, Schedule, SchedulePeriodicity } from '../../types';

type TabFilter = 'all' | 'overdue' | 'upcoming';

const periodicityLabel = (p?: SchedulePeriodicity) =>
  p === 'QUARTERLY' ? 'Trimestriel' : p === 'BIMONTHLY' ? 'Bimestriel' : 'Mensuel';

function exportSchedulesCsv(schedules: Schedule[]) {
  const header = ['Client', 'Facture', 'Échéance N°', 'Date échéance', 'Montant', 'Statut', 'Payé le'];
  const lines: string[][] = [];
  schedules.forEach((s) => {
    s.installments.forEach((inst, idx) => {
      const eff = installmentEffectiveStatus(inst);
      lines.push([
        `"${s.clientName.replace(/"/g, '""')}"`,
        s.invoiceNumber,
        String(idx + 1),
        inst.dueDate,
        String(inst.amount),
        eff,
        inst.paidDate || '',
      ]);
    });
  });
  const csv = [header.join(';'), ...lines.map((l) => l.join(';'))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `echeanciers_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const Schedules: React.FC = () => {
  const { schedules, invoices, addSchedule, payInstallment, deleteSchedule } = useData();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<TabFilter>('all');
  const [form, setForm] = useState({
    invoiceId: '',
    installmentCount: 3,
    firstDueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    periodicity: 'MONTHLY' as SchedulePeriodicity,
    notes: '',
  });

  const [payCtx, setPayCtx] = useState<{ scheduleId: string; installmentId: string; amount: number } | null>(null);
  const [payDetail, setPayDetail] = useState({
    method: 'TRANSFER' as PaymentMethod,
    reference: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const openInvoices = invoices.filter((i) => i.status !== 'PAID' && i.status !== 'DRAFT');

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const summary = useMemo(() => {
    let totalDue = 0;
    let overdueCount = 0;
    let upcoming30 = 0;
    let pendingInst = 0;
    schedules.forEach((s) => {
      s.installments.forEach((inst) => {
        if (inst.status === 'PAID') return;
        pendingInst++;
        totalDue += inst.amount;
        const eff = installmentEffectiveStatus(inst);
        if (eff === 'OVERDUE') overdueCount++;
        const due = parseLocalDate(inst.dueDate);
        const in30 = new Date(today);
        in30.setDate(in30.getDate() + 30);
        if (due >= today && due <= in30) upcoming30++;
      });
    });
    return { totalDue, overdueCount, upcoming30, pendingInst, scheduleCount: schedules.length };
  }, [schedules, today]);

  const flatInstallments = useMemo(() => {
    const rows: {
      schedule: Schedule;
      inst: Schedule['installments'][0];
      idx: number;
      effective: ReturnType<typeof installmentEffectiveStatus>;
    }[] = [];
    schedules.forEach((s) => {
      s.installments.forEach((inst, idx) => {
        const effective = installmentEffectiveStatus(inst);
        rows.push({ schedule: s, inst, idx, effective });
      });
    });
    return rows.sort((a, b) => a.inst.dueDate.localeCompare(b.inst.dueDate));
  }, [schedules]);

  const filteredFlat = useMemo(() => {
    return flatInstallments.filter((r) => {
      if (r.effective === 'PAID') return false;
      if (tab === 'all') return true;
      if (tab === 'overdue') return r.effective === 'OVERDUE';
      const due = parseLocalDate(r.inst.dueDate);
      const in30 = new Date(today);
      in30.setDate(in30.getDate() + 30);
      return due >= today && due <= in30;
    });
  }, [flatInstallments, tab, today]);

  const submit = () => {
    const inv = invoices.find((i) => i.id === form.invoiceId);
    if (!inv) return toast('Sélectionnez une facture', 'error');
    if (form.installmentCount < 2) return toast('Minimum 2 échéances', 'error');

    const remaining = inv.totalAmount - inv.paidAmount;
    const baseAmount = Math.floor((remaining / form.installmentCount) * 100) / 100;
    const stepMonths =
      form.periodicity === 'QUARTERLY' ? 3 : form.periodicity === 'BIMONTHLY' ? 2 : 1;

    const installments = Array.from({ length: form.installmentCount }, (_, idx) => {
      const date = new Date(form.firstDueDate + 'T12:00:00');
      date.setMonth(date.getMonth() + idx * stepMonths);
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
      periodicity: form.periodicity,
      notes: form.notes.trim() || undefined,
      createdAt: new Date().toISOString().split('T')[0],
    });
    toast('Échéancier créé');
    setShowForm(false);
    setForm((f) => ({ ...f, notes: '' }));
  };

  const openPay = (scheduleId: string, installmentId: string, amount: number) => {
    setPayDetail({
      method: 'TRANSFER',
      reference: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setPayCtx({ scheduleId, installmentId, amount });
  };

  const confirmPay = () => {
    if (!payCtx) return;
    const ok = payInstallment(payCtx.scheduleId, payCtx.installmentId, {
      method: payDetail.method,
      reference: payDetail.reference || undefined,
      date: payDetail.date,
      notes: payDetail.notes || undefined,
    });
    if (ok) {
      toast('Encaissement enregistré (facture et journal mis à jour)');
      setPayCtx(null);
    } else {
      toast('Impossible d’encaisser (vérifiez le solde facture ou l’échéance).', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Supprimer cet échéancier ?',
      message: 'Toutes les échéances seront retirées (les paiements déjà liés restent sur la facture).',
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
          <h2 className="text-2xl font-bold text-slate-900">Échéanciers de paiement</h2>
          <p className="text-slate-500 text-sm">
            Plans échelonnés, périodicité, calendrier des échéances et encaissement relié aux factures.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SecondaryButton onClick={() => exportSchedulesCsv(schedules)}>
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </span>
          </SecondaryButton>
          <PrimaryButton onClick={() => setShowForm(true)}>
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Créer un échéancier
            </span>
          </PrimaryButton>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="premium-card p-5 border-b-4 border-b-darbis-blue">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plans actifs</p>
          <p className="text-2xl font-bold text-slate-900">{summary.scheduleCount}</p>
        </div>
        <div className="premium-card p-5 border-b-4 border-b-amber-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Échéances en retard</p>
          <p className="text-2xl font-bold text-red-600">{summary.overdueCount}</p>
        </div>
        <div className="premium-card p-5 border-b-4 border-b-emerald-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">À venir (30 j.)</p>
          <p className="text-2xl font-bold text-slate-900">{summary.upcoming30}</p>
        </div>
        <div className="premium-card p-5 border-b-4 border-b-slate-400">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reste sur échéances ouvertes</p>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(summary.totalDue)}</p>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-darbis-blue" />
            <h3 className="font-bold text-slate-900">Calendrier des échéances</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['all', 'Toutes ouvertes'],
                ['overdue', 'En retard'],
                ['upcoming', '30 jours'],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors',
                  tab === k ? 'bg-darbis-blue text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white shadow-sm z-10">
              <tr className="text-xs font-bold text-slate-400 uppercase">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Client / Facture</th>
                <th className="px-4 py-3 text-right">Montant</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredFlat.map(({ schedule, inst, effective }) => (
                <tr key={`${schedule.id}-${inst.id}`} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(inst.dueDate)}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-800">{schedule.clientName}</span>
                    <span className="text-slate-400 mx-1">·</span>
                    <span className="text-xs text-slate-500">{schedule.invoiceNumber}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold">{formatCurrency(inst.amount)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase px-2 py-0.5 rounded',
                        effective === 'OVERDUE' && 'bg-red-100 text-red-700',
                        effective === 'PENDING' && 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {effective === 'OVERDUE' ? 'En retard' : 'À venir'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredFlat.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                    Aucune échéance dans cette vue
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {schedules.length === 0 && (
          <div className="premium-card p-16 text-center">
            <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Aucun échéancier pour le moment</p>
            <button type="button" onClick={() => setShowForm(true)} className="mt-4 text-sm font-bold text-darbis-blue hover:underline">
              + Créer le premier
            </button>
          </div>
        )}
        {schedules.map((schedule) => {
          const paidCount = schedule.installments.filter((i) => i.status === 'PAID').length;
          const progress = (paidCount / schedule.installments.length) * 100;
          return (
            <div key={schedule.id} className="premium-card overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-start justify-between gap-4 bg-slate-50/30">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-lg">{schedule.clientName}</h3>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase">
                      {schedule.invoiceNumber}
                    </span>
                    {schedule.periodicity && (
                      <span className="px-2 py-0.5 bg-darbis-blue/10 text-darbis-blue rounded text-[10px] font-bold">
                        {periodicityLabel(schedule.periodicity)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Plan initial : {formatCurrency(schedule.totalAmount)} • Reste :{' '}
                    <span className={cn('font-bold', schedule.remainingAmount > 0 ? 'text-red-600' : 'text-green-600')}>
                      {formatCurrency(schedule.remainingAmount)}
                    </span>
                    {schedule.createdAt && (
                      <>
                        {' '}
                        · Créé le {formatDate(schedule.createdAt)}
                      </>
                    )}
                  </p>
                  {schedule.notes && (
                    <p className="text-xs text-slate-600 bg-white/80 border border-slate-100 rounded-lg px-3 py-2 mt-2">{schedule.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Progression</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-36 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-darbis-blue h-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{Math.round(progress)}%</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(schedule.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Supprimer le plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {schedule.installments.map((inst, idx) => {
                    const eff = installmentEffectiveStatus(inst);
                    return (
                      <div
                        key={inst.id}
                        className={cn(
                          'p-4 rounded-xl border flex flex-col justify-between min-h-[140px] relative',
                          inst.status === 'PAID'
                            ? 'bg-green-50/50 border-green-100'
                            : eff === 'OVERDUE'
                              ? 'bg-red-50/50 border-red-100'
                              : 'bg-white border-slate-100'
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Échéance {idx + 1}</span>
                          {inst.status === 'PAID' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          ) : eff === 'OVERDUE' ? (
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-slate-300 shrink-0" />
                          )}
                        </div>
                        <div>
                          <p className="text-lg font-bold text-slate-800">{formatCurrency(inst.amount)}</p>
                          <p className="text-xs text-slate-500">Prévu le {formatDate(inst.dueDate)}</p>
                          {inst.status === 'PAID' && inst.paidDate && (
                            <p className="text-[10px] text-green-700 font-medium mt-1">Payé le {formatDate(inst.paidDate)}</p>
                          )}
                          {inst.status !== 'PAID' && (
                            <p className="text-[10px] font-bold mt-1 text-slate-500">
                              {eff === 'OVERDUE' ? <span className="text-red-600">En retard</span> : 'À échoir'}
                            </p>
                          )}
                        </div>
                        {inst.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => openPay(schedule.id, inst.id, inst.amount)}
                            className="mt-3 w-full flex items-center justify-center gap-1 py-2 rounded-lg bg-darbis-blue/10 text-darbis-blue text-xs font-bold uppercase hover:bg-darbis-blue/20"
                          >
                            Encaisser
                            <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
                          </button>
                        )}
                      </div>
                    );
                  })}
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
                max={24}
                value={form.installmentCount}
                onChange={(e) => setForm({ ...form, installmentCount: Number(e.target.value) })}
              />
            </Field>
            <Field label="Première échéance">
              <Input type="date" value={form.firstDueDate} onChange={(e) => setForm({ ...form, firstDueDate: e.target.value })} />
            </Field>
            <div className="col-span-2">
              <Field label="Périodicité">
                <Select
                  value={form.periodicity}
                  onChange={(e) => setForm({ ...form, periodicity: e.target.value as SchedulePeriodicity })}
                >
                  <option value="MONTHLY">Mensuelle</option>
                  <option value="BIMONTHLY">Bimestrielle (+2 mois)</option>
                  <option value="QUARTERLY">Trimestrielle (+3 mois)</option>
                </Select>
              </Field>
            </div>
          </div>
          <Field label="Notes (interne)">
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Conditions, contact, référence du plan..."
            />
          </Field>
          <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
            Le montant restant dû sur la facture est réparti en parts égales (dernière ligne ajustée). Les dates suivent la périodicité choisie à partir de la première échéance.
          </p>
        </div>
      </Modal>

      <Modal
        open={!!payCtx}
        onClose={() => setPayCtx(null)}
        title="Encaisser l'échéance"
        size="md"
        footer={
          <>
            <SecondaryButton onClick={() => setPayCtx(null)}>Annuler</SecondaryButton>
            <PrimaryButton onClick={confirmPay}>Valider l'encaissement</PrimaryButton>
          </>
        }
      >
        {payCtx && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 text-sm">
              <p className="font-bold text-slate-900">{formatCurrency(payCtx.amount)}</p>
              <p className="text-xs text-slate-500 mt-1">Créera une ligne dans Encaissements et mettra à jour la facture.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date">
                <Input type="date" value={payDetail.date} onChange={(e) => setPayDetail({ ...payDetail, date: e.target.value })} />
              </Field>
              <Field label="Mode">
                <Select value={payDetail.method} onChange={(e) => setPayDetail({ ...payDetail, method: e.target.value as PaymentMethod })}>
                  <option value="TRANSFER">Virement</option>
                  <option value="CASH">Espèces</option>
                  <option value="CHECK">Chèque</option>
                  <option value="CARD">Carte bancaire</option>
                  <option value="OTHER">Autre</option>
                </Select>
              </Field>
              <div className="col-span-2">
                <Field label="Référence">
                  <Input value={payDetail.reference} onChange={(e) => setPayDetail({ ...payDetail, reference: e.target.value })} />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Notes">
                  <Input value={payDetail.notes} onChange={(e) => setPayDetail({ ...payDetail, notes: e.target.value })} />
                </Field>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
