import React, { useState } from 'react';
import { Mail, MessageSquare, Settings2, Play, Pause, AlertTriangle, Send } from 'lucide-react';
import { useData } from '../../store/DataContext';
import { useToast } from '../ui/Toast';
import { Modal, Field, Input, Textarea, PrimaryButton, SecondaryButton } from '../ui/Modal';
import { cn } from '../../lib/utils';

export const Reminders: React.FC = () => {
  const { reminderWorkflows, toggleReminderWorkflow, invoices, addAuditLog } = useData();
  const { toast } = useToast();
  const [editId, setEditId] = useState<number | null>(null);
  const [template, setTemplate] = useState({ subject: '', body: '' });
  const [showSendNow, setShowSendNow] = useState(false);
  const [sendForm, setSendForm] = useState({ invoiceId: '', channel: 'EMAIL' as 'EMAIL' | 'SMS', message: '' });

  const overdueInvoices = invoices.filter((i) => i.status === 'OVERDUE');

  const openEdit = (id: number) => {
    const wf = reminderWorkflows.find((w) => w.id === id);
    if (!wf) return;
    setEditId(id);
    setTemplate({
      subject: `Rappel — ${wf.name}`,
      body: `Bonjour,\n\nNous vous rappelons que la facture {{numero}} du montant de {{montant}} arrive à échéance.\n\nMerci de procéder au règlement.\n\nCordialement,\nBureau Darbis Consulting`,
    });
  };

  const saveTemplate = () => {
    toast('Template enregistré');
    setEditId(null);
    addAuditLog('Template de relance modifié');
  };

  const sendNow = () => {
    if (!sendForm.invoiceId) return toast('Sélectionnez une facture', 'error');
    toast(`Relance ${sendForm.channel === 'EMAIL' ? 'email' : 'SMS'} envoyée (démo)`);
    addAuditLog(`Relance manuelle envoyée (${sendForm.channel})`);
    setShowSendNow(false);
  };

  const recentHistory = [
    { client: 'Atlas Industries', type: 'Email Préventif', status: 'DELIVERED' as const, time: 'Il y a 2h' },
    { client: 'Société Générale', type: 'SMS Retard J+5', status: 'FAILED' as const, time: 'Il y a 5h' },
    { client: 'Maroc Telecom', type: 'Email Relance J+1', status: 'DELIVERED' as const, time: 'Hier' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Relances Automatiques</h2>
          <p className="text-slate-500 text-sm">Automatisez vos communications de recouvrement.</p>
        </div>
        <div className="flex gap-3">
          <SecondaryButton onClick={() => toast('Configuration sauvegardée', 'success')}>
            <span className="flex items-center gap-2"><Settings2 className="w-4 h-4" />Configuration</span>
          </SecondaryButton>
          <PrimaryButton onClick={() => setShowSendNow(true)}>
            <span className="flex items-center gap-2"><Send className="w-4 h-4" />Relance immédiate</span>
          </PrimaryButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reminderWorkflows.map((wf) => (
          <div key={wf.id} className="premium-card p-6 group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn('p-3 rounded-xl', wf.channel.includes('SMS') ? 'bg-orange-50 text-orange-600' : 'bg-darbis-blue/5 text-darbis-blue')}>
                  {wf.channel.includes('SMS') ? <MessageSquare className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{wf.name}</h3>
                  <p className="text-xs text-slate-400">Trigger : {wf.trigger}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                  wf.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'
                )}>
                  {wf.status === 'ACTIVE' ? 'Actif' : 'En pause'}
                </span>
                <button
                  onClick={() => {
                    toggleReminderWorkflow(wf.id);
                    toast(wf.status === 'ACTIVE' ? 'Workflow mis en pause' : 'Workflow activé');
                  }}
                  className="p-2 text-slate-400 hover:text-slate-700"
                >
                  {wf.status === 'ACTIVE' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-4 border-t border-slate-50 mt-4">
              <div>
                <p className="text-sm font-bold text-slate-700">{wf.count} envois</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">30 derniers jours</p>
              </div>
              <button
                onClick={() => openEdit(wf.id)}
                className="text-xs font-bold text-darbis-blue hover:underline"
              >
                Éditer le template →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 premium-card">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Historique des envois récents</h3>
          </div>
          <div className="p-6 space-y-4">
            {recentHistory.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className={cn('w-2 h-2 rounded-full', h.status === 'FAILED' ? 'bg-red-500' : 'bg-green-500')}></div>
                  <div>
                    <span className="font-bold text-slate-800">{h.client}</span>
                    <span className="text-slate-400 mx-2">•</span>
                    <span className="text-slate-500">{h.type}</span>
                  </div>
                </div>
                <span className="text-xs text-slate-400">{h.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card p-6 bg-orange-50/50 border-orange-100">
          <div className="flex items-center gap-2 text-orange-800 mb-4">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold">Crédits SMS</h3>
          </div>
          <p className="text-sm text-orange-700 leading-relaxed mb-6">
            Il vous reste <span className="font-bold">142 crédits</span>. Pensez à recharger.
          </p>
          <button
            onClick={() => toast('Demande de recharge envoyée', 'success')}
            className="w-full py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-orange-700 transition-all uppercase tracking-wider"
          >
            Recharger maintenant
          </button>
        </div>
      </div>

      <Modal
        open={!!editId}
        onClose={() => setEditId(null)}
        title="Template de relance"
        size="lg"
        footer={
          <>
            <SecondaryButton onClick={() => setEditId(null)}>Annuler</SecondaryButton>
            <PrimaryButton onClick={saveTemplate}>Enregistrer</PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Sujet">
            <Input value={template.subject} onChange={(e) => setTemplate({ ...template, subject: e.target.value })} />
          </Field>
          <Field label="Corps du message" hint="Variables : {{numero}}, {{montant}}, {{client}}, {{echeance}}">
            <Textarea rows={10} value={template.body} onChange={(e) => setTemplate({ ...template, body: e.target.value })} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={showSendNow}
        onClose={() => setShowSendNow(false)}
        title="Envoyer une relance immédiate"
        footer={
          <>
            <SecondaryButton onClick={() => setShowSendNow(false)}>Annuler</SecondaryButton>
            <PrimaryButton onClick={sendNow}>
              <span className="flex items-center gap-2"><Send className="w-4 h-4" />Envoyer</span>
            </PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Facture concernée *">
            <select
              value={sendForm.invoiceId}
              onChange={(e) => setSendForm({ ...sendForm, invoiceId: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white"
            >
              <option value="">Sélectionner une facture en retard</option>
              {overdueInvoices.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.invoiceNumber} — {i.clientName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Canal">
            <div className="flex gap-2">
              {(['EMAIL', 'SMS'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setSendForm({ ...sendForm, channel: c })}
                  className={cn(
                    'flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2',
                    sendForm.channel === c ? 'bg-darbis-blue text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  )}
                >
                  {c === 'EMAIL' ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                  {c}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Message">
            <Textarea rows={5} value={sendForm.message} onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })} placeholder="Personnalisez votre message..." />
          </Field>
        </div>
      </Modal>
    </div>
  );
};
