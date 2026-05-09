import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import {
  Client,
  Quote,
  Invoice,
  Payment,
  Schedule,
  PaymentMethod,
  Service,
  Supplier,
  Expense,
  RecoveryCase,
  User,
  ClientStatus,
} from '../types';
import {
  mockClients,
  mockQuotes,
  mockInvoices,
  mockPayments,
  mockSchedules,
  mockServices,
  mockSuppliers,
  mockExpenses,
  mockRecoveryCases,
} from '../data/mockData';

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  date: string;
  entity?: string;
}

export interface ReminderWorkflow {
  id: number;
  name: string;
  trigger: string;
  channel: string;
  status: 'ACTIVE' | 'PAUSED';
  count: number;
}

interface DataContextValue {
  // Auth
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;

  // Clients
  clients: Client[];
  addClient: (c: Omit<Client, 'id' | 'totalInvoiced' | 'totalPaid' | 'balance'>) => Client;
  updateClient: (id: string, c: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Services
  services: Service[];
  addService: (s: Omit<Service, 'id'>) => Service;
  updateService: (id: string, s: Partial<Service>) => void;
  deleteService: (id: string) => void;
  toggleServiceActive: (id: string) => void;

  // Quotes
  quotes: Quote[];
  addQuote: (q: Omit<Quote, 'id' | 'quoteNumber'>) => Quote;
  updateQuote: (id: string, q: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  convertQuoteToInvoice: (quoteId: string) => Invoice | null;

  // Invoices
  invoices: Invoice[];
  addInvoice: (i: Omit<Invoice, 'id' | 'invoiceNumber' | 'paidAmount'>) => Invoice;
  updateInvoice: (id: string, i: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  // Payments
  payments: Payment[];
  addPayment: (p: Omit<Payment, 'id'>) => Payment;
  deletePayment: (id: string) => void;

  // Schedules
  schedules: Schedule[];
  addSchedule: (s: Omit<Schedule, 'id'>) => Schedule;
  payInstallment: (
    scheduleId: string,
    installmentId: string,
    detail?: { method?: PaymentMethod; reference?: string; date?: string; notes?: string }
  ) => boolean;
  deleteSchedule: (id: string) => void;

  // Suppliers
  suppliers: Supplier[];
  addSupplier: (s: Omit<Supplier, 'id' | 'totalSpent' | 'outstanding'>) => Supplier;
  updateSupplier: (id: string, s: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Expenses
  expenses: Expense[];
  addExpense: (e: Omit<Expense, 'id' | 'reference'>) => Expense;
  updateExpense: (id: string, e: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  markExpensePaid: (id: string) => void;

  // Recovery
  recoveryCases: RecoveryCase[];
  addRecoveryCase: (r: Omit<RecoveryCase, 'id'>) => RecoveryCase;
  updateRecoveryCase: (id: string, r: Partial<RecoveryCase>) => void;
  deleteRecoveryCase: (id: string) => void;

  // Users (admin)
  users: User[];
  addUser: (u: Omit<User, 'id'>) => User;
  updateUser: (id: string, u: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Reminder workflows
  reminderWorkflows: ReminderWorkflow[];
  toggleReminderWorkflow: (id: number) => void;

  // Audit
  auditLogs: AuditLog[];
  addAuditLog: (action: string, entity?: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

let counter = 1000;
const genId = (prefix: string) => `${prefix}${++counter}`;

const mockUsers: User[] = [
  { id: 'u1', name: 'Ahmed Bennani', email: 'a.bennani@darbis.ma', role: 'ADMIN' },
  { id: 'u2', name: 'Sara Fassi', email: 's.fassi@darbis.ma', role: 'ACCOUNTANT' },
  { id: 'u3', name: 'Youssef Alami', email: 'y.alami@darbis.ma', role: 'RECOVERY_AGENT' },
  { id: 'u4', name: 'Imane Drissi', email: 'i.drissi@darbis.ma', role: 'FINANCIAL_MANAGER' },
];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [services, setServices] = useState<Service[]>(mockServices);
  const [quotes, setQuotes] = useState<Quote[]>(mockQuotes);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [recoveryCases, setRecoveryCases] = useState<RecoveryCase[]>(mockRecoveryCases);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'a1', action: 'Connexion réussie', user: 'Ahmed B.', date: new Date().toISOString() },
  ]);
  const [reminderWorkflows, setReminderWorkflows] = useState<ReminderWorkflow[]>([
    { id: 1, name: 'Relance 1 (Préventive)', trigger: '3 jours avant', channel: 'Email', status: 'ACTIVE', count: 24 },
    { id: 2, name: 'Relance 2 (Jour J)', trigger: "Jour de l'échéance", channel: 'SMS + Email', status: 'ACTIVE', count: 12 },
    { id: 3, name: 'Relance 3 (Retard)', trigger: '5 jours après', channel: 'Email (Template Ferme)', status: 'ACTIVE', count: 8 },
    { id: 4, name: 'Relance Final (Contentieux)', trigger: '15 jours après', channel: 'Courrier + Email', status: 'PAUSED', count: 0 },
  ]);

  const addAuditLog = useCallback((action: string, entity?: string) => {
    setAuditLogs((prev) => [
      {
        id: genId('a'),
        action,
        user: currentUser?.name || 'Système',
        date: new Date().toISOString(),
        entity,
      },
      ...prev,
    ].slice(0, 50));
  }, [currentUser]);

  // ─── Auth ─────────────────────────────
  const login = (email: string, _password: string) => {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || users[0];
    setCurrentUser(user);
    setAuditLogs((prev) => [
      { id: genId('a'), action: 'Connexion réussie', user: user.name, date: new Date().toISOString() },
      ...prev,
    ]);
    return true;
  };
  const logout = () => {
    if (currentUser) {
      setAuditLogs((prev) => [
        { id: genId('a'), action: 'Déconnexion', user: currentUser.name, date: new Date().toISOString() },
        ...prev,
      ]);
    }
    setCurrentUser(null);
  };

  // ─── Clients ──────────────────────────
  const addClient: DataContextValue['addClient'] = (c) => {
    const newClient: Client = { ...c, id: genId('c'), totalInvoiced: 0, totalPaid: 0, balance: 0 };
    setClients((p) => [...p, newClient]);
    addAuditLog('Client créé', newClient.name);
    return newClient;
  };
  const updateClient: DataContextValue['updateClient'] = (id, c) => {
    setClients((p) => p.map((cl) => (cl.id === id ? { ...cl, ...c } : cl)));
    addAuditLog('Client modifié', c.name);
  };
  const deleteClient: DataContextValue['deleteClient'] = (id) => {
    const cl = clients.find((c) => c.id === id);
    setClients((p) => p.filter((c) => c.id !== id));
    if (cl) addAuditLog('Client supprimé', cl.name);
  };

  // ─── Services ─────────────────────────
  const addService: DataContextValue['addService'] = (s) => {
    const ns: Service = { ...s, id: genId('srv') };
    setServices((p) => [...p, ns]);
    addAuditLog('Service créé', ns.name);
    return ns;
  };
  const updateService: DataContextValue['updateService'] = (id, s) => {
    setServices((p) => p.map((sv) => (sv.id === id ? { ...sv, ...s } : sv)));
    addAuditLog('Service modifié');
  };
  const deleteService: DataContextValue['deleteService'] = (id) => {
    const sv = services.find((s) => s.id === id);
    setServices((p) => p.filter((s) => s.id !== id));
    if (sv) addAuditLog('Service supprimé', sv.name);
  };
  const toggleServiceActive: DataContextValue['toggleServiceActive'] = (id) => {
    setServices((p) => p.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
    addAuditLog('Statut service modifié');
  };

  // ─── Quotes ───────────────────────────
  const addQuote: DataContextValue['addQuote'] = (q) => {
    const num = `DEV-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`;
    const nq: Quote = { ...q, id: genId('q'), quoteNumber: num };
    setQuotes((p) => [...p, nq]);
    addAuditLog('Devis créé', num);
    return nq;
  };
  const updateQuote: DataContextValue['updateQuote'] = (id, q) => {
    setQuotes((p) => p.map((qu) => (qu.id === id ? { ...qu, ...q } : qu)));
    addAuditLog('Devis modifié');
  };
  const deleteQuote: DataContextValue['deleteQuote'] = (id) => {
    const q = quotes.find((qq) => qq.id === id);
    setQuotes((p) => p.filter((qq) => qq.id !== id));
    if (q) addAuditLog('Devis supprimé', q.quoteNumber);
  };
  const convertQuoteToInvoice: DataContextValue['convertQuoteToInvoice'] = (quoteId) => {
    const q = quotes.find((qu) => qu.id === quoteId);
    if (!q) return null;
    const num = `FACT-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
    const today = new Date();
    const due = new Date();
    due.setDate(today.getDate() + 30);
    const ni: Invoice = {
      id: genId('inv'),
      invoiceNumber: num,
      clientId: q.clientId,
      clientName: q.clientName,
      date: today.toISOString().split('T')[0],
      dueDate: due.toISOString().split('T')[0],
      amount: q.amount,
      taxAmount: q.taxAmount,
      totalAmount: q.totalAmount,
      paidAmount: 0,
      status: 'SENT',
      items: q.items,
    };
    setInvoices((p) => [...p, ni]);
    setQuotes((p) => p.map((qu) => (qu.id === quoteId ? { ...qu, status: 'ACCEPTED' as const } : qu)));
    addAuditLog(`Devis ${q.quoteNumber} converti en facture ${num}`);
    return ni;
  };

  // ─── Invoices ─────────────────────────
  const addInvoice: DataContextValue['addInvoice'] = (i) => {
    const num = `FACT-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
    const ni: Invoice = { ...i, id: genId('inv'), invoiceNumber: num, paidAmount: 0 };
    setInvoices((p) => [...p, ni]);
    setClients((p) =>
      p.map((c) =>
        c.id === ni.clientId
          ? { ...c, totalInvoiced: c.totalInvoiced + ni.totalAmount, balance: c.balance + ni.totalAmount }
          : c
      )
    );
    addAuditLog('Facture créée', num);
    return ni;
  };
  const updateInvoice: DataContextValue['updateInvoice'] = (id, i) => {
    setInvoices((p) => p.map((inv) => (inv.id === id ? { ...inv, ...i } : inv)));
    addAuditLog('Facture modifiée');
  };
  const deleteInvoice: DataContextValue['deleteInvoice'] = (id) => {
    const inv = invoices.find((i) => i.id === id);
    setInvoices((p) => p.filter((i) => i.id !== id));
    if (inv) addAuditLog('Facture supprimée', inv.invoiceNumber);
  };

  // ─── Payments ─────────────────────────
  const addPayment: DataContextValue['addPayment'] = (p) => {
    const np: Payment = { ...p, id: genId('p') };
    setPayments((prev) => [np, ...prev]);
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== p.invoiceId) return inv;
        const newPaid = inv.paidAmount + p.amount;
        const status: Invoice['status'] =
          newPaid >= inv.totalAmount ? 'PAID' : newPaid > 0 ? 'PARTIAL' : inv.status;
        return { ...inv, paidAmount: newPaid, status };
      })
    );
    setClients((prev) =>
      prev.map((c) =>
        c.id === p.clientId
          ? {
              ...c,
              totalPaid: c.totalPaid + p.amount,
              balance: Math.max(0, c.balance - p.amount),
              lastPaymentDate: p.date,
            }
          : c
      )
    );
    addAuditLog(`Paiement enregistré (${p.amount})`, p.invoiceNumber);
    return np;
  };
  const deletePayment: DataContextValue['deletePayment'] = (id) => {
    const pay = payments.find((p) => p.id === id);
    if (!pay) return;
    setPayments((p) => p.filter((pp) => pp.id !== id));
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== pay.invoiceId) return inv;
        const newPaid = inv.paidAmount - pay.amount;
        const status: Invoice['status'] = newPaid <= 0 ? 'SENT' : newPaid >= inv.totalAmount ? 'PAID' : 'PARTIAL';
        return { ...inv, paidAmount: Math.max(0, newPaid), status };
      })
    );
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== pay.clientId) return c;
        const remainingForClient = payments.filter((p) => p.id !== id && p.clientId === c.id);
        const sorted = [...remainingForClient].sort((a, b) => b.date.localeCompare(a.date));
        return {
          ...c,
          totalPaid: Math.max(0, c.totalPaid - pay.amount),
          balance: c.balance + pay.amount,
          lastPaymentDate: sorted[0]?.date,
        };
      })
    );
    if (pay.scheduleId && pay.installmentId) {
      setSchedules((prev) =>
        prev.map((s) => {
          if (s.id !== pay.scheduleId) return s;
          const installments = s.installments.map((i) =>
            i.id === pay.installmentId
              ? { ...i, status: 'PENDING' as const, paidDate: undefined, paymentId: undefined }
              : i
          );
          const remaining = installments.filter((x) => x.status !== 'PAID').reduce((sum, x) => sum + x.amount, 0);
          return { ...s, installments, remainingAmount: remaining };
        })
      );
    }
    addAuditLog('Paiement annulé');
  };

  // ─── Schedules ────────────────────────
  const addSchedule: DataContextValue['addSchedule'] = (s) => {
    const ns: Schedule = { ...s, id: genId('sch') };
    setSchedules((p) => [...p, ns]);
    addAuditLog('Échéancier créé', ns.invoiceNumber);
    return ns;
  };
  const payInstallment: DataContextValue['payInstallment'] = (scheduleId, installmentId, detail) => {
    const sch = schedules.find((s) => s.id === scheduleId);
    const inst = sch?.installments.find((i) => i.id === installmentId);
    if (!sch || !inst || inst.status === 'PAID') return false;

    const inv = invoices.find((i) => i.id === sch.invoiceId);
    const remainingInv = inv ? inv.totalAmount - inv.paidAmount : 0;
    if (!inv || inst.amount > remainingInv + 0.01) return false;

    const payDate = detail?.date ?? new Date().toISOString().split('T')[0];
    const np = addPayment({
      invoiceId: sch.invoiceId,
      invoiceNumber: sch.invoiceNumber,
      clientId: sch.clientId,
      clientName: sch.clientName,
      date: payDate,
      amount: inst.amount,
      method: detail?.method ?? 'TRANSFER',
      reference: detail?.reference,
      notes: detail?.notes,
      scheduleId,
      installmentId,
    });

    setSchedules((prev) =>
      prev.map((s) => {
        if (s.id !== scheduleId) return s;
        const installments = s.installments.map((i) =>
          i.id === installmentId
            ? { ...i, status: 'PAID' as const, paidDate: payDate, paymentId: np.id }
            : i
        );
        const remaining = installments.filter((x) => x.status !== 'PAID').reduce((sum, x) => sum + x.amount, 0);
        return { ...s, installments, remainingAmount: remaining };
      })
    );
    addAuditLog(`Échéance encaissée (${sch.invoiceNumber})`, sch.invoiceNumber);
    return true;
  };
  const deleteSchedule: DataContextValue['deleteSchedule'] = (id) => {
    setSchedules((p) => p.filter((s) => s.id !== id));
    addAuditLog('Échéancier supprimé');
  };

  // ─── Suppliers ────────────────────────
  const addSupplier: DataContextValue['addSupplier'] = (s) => {
    const ns: Supplier = { ...s, id: genId('sup'), totalSpent: 0, outstanding: 0 };
    setSuppliers((p) => [...p, ns]);
    addAuditLog('Fournisseur créé', ns.name);
    return ns;
  };
  const updateSupplier: DataContextValue['updateSupplier'] = (id, s) => {
    setSuppliers((p) => p.map((su) => (su.id === id ? { ...su, ...s } : su)));
    addAuditLog('Fournisseur modifié');
  };
  const deleteSupplier: DataContextValue['deleteSupplier'] = (id) => {
    const su = suppliers.find((s) => s.id === id);
    setSuppliers((p) => p.filter((s) => s.id !== id));
    if (su) addAuditLog('Fournisseur supprimé', su.name);
  };

  // ─── Expenses ─────────────────────────
  const addExpense: DataContextValue['addExpense'] = (e) => {
    const ref = `ACH-${new Date().getFullYear()}-${String(expenses.length + 1).padStart(3, '0')}`;
    const ne: Expense = { ...e, id: genId('exp'), reference: ref };
    setExpenses((p) => [...p, ne]);
    setSuppliers((p) =>
      p.map((s) =>
        s.id === e.supplierId
          ? {
              ...s,
              totalSpent: s.totalSpent + e.totalAmount,
              outstanding: e.status === 'PAID' ? s.outstanding : s.outstanding + e.totalAmount,
            }
          : s
      )
    );
    addAuditLog('Dépense enregistrée', ref);
    return ne;
  };
  const updateExpense: DataContextValue['updateExpense'] = (id, e) => {
    setExpenses((p) => p.map((ex) => (ex.id === id ? { ...ex, ...e } : ex)));
    addAuditLog('Dépense modifiée');
  };
  const deleteExpense: DataContextValue['deleteExpense'] = (id) => {
    setExpenses((p) => p.filter((ex) => ex.id !== id));
    addAuditLog('Dépense supprimée');
  };
  const markExpensePaid: DataContextValue['markExpensePaid'] = (id) => {
    const exp = expenses.find((e) => e.id === id);
    setExpenses((p) => p.map((ex) => (ex.id === id ? { ...ex, status: 'PAID' as const } : ex)));
    if (exp) {
      setSuppliers((p) =>
        p.map((s) =>
          s.id === exp.supplierId ? { ...s, outstanding: Math.max(0, s.outstanding - exp.totalAmount) } : s
        )
      );
    }
    addAuditLog('Dépense payée', exp?.reference);
  };

  // ─── Recovery ─────────────────────────
  const addRecoveryCase: DataContextValue['addRecoveryCase'] = (r) => {
    const nr: RecoveryCase = { ...r, id: genId('rec') };
    setRecoveryCases((p) => [...p, nr]);
    addAuditLog('Dossier de recouvrement créé', nr.invoiceNumber);
    return nr;
  };
  const updateRecoveryCase: DataContextValue['updateRecoveryCase'] = (id, r) => {
    setRecoveryCases((p) => p.map((rc) => (rc.id === id ? { ...rc, ...r } : rc)));
    addAuditLog('Dossier de recouvrement modifié');
  };
  const deleteRecoveryCase: DataContextValue['deleteRecoveryCase'] = (id) => {
    setRecoveryCases((p) => p.filter((rc) => rc.id !== id));
    addAuditLog('Dossier de recouvrement supprimé');
  };

  // ─── Users ────────────────────────────
  const addUser: DataContextValue['addUser'] = (u) => {
    const nu: User = { ...u, id: genId('u') };
    setUsers((p) => [...p, nu]);
    addAuditLog('Utilisateur créé', nu.name);
    return nu;
  };
  const updateUser: DataContextValue['updateUser'] = (id, u) => {
    setUsers((p) => p.map((us) => (us.id === id ? { ...us, ...u } : us)));
    addAuditLog('Utilisateur modifié');
  };
  const deleteUser: DataContextValue['deleteUser'] = (id) => {
    const us = users.find((u) => u.id === id);
    setUsers((p) => p.filter((u) => u.id !== id));
    if (us) addAuditLog('Utilisateur supprimé', us.name);
  };

  // ─── Reminder workflows ───────────────
  const toggleReminderWorkflow: DataContextValue['toggleReminderWorkflow'] = (id) => {
    setReminderWorkflows((p) =>
      p.map((w) => (w.id === id ? { ...w, status: w.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : w))
    );
    addAuditLog('Workflow de relance modifié');
  };

  return (
    <DataContext.Provider
      value={{
        currentUser,
        login,
        logout,
        clients,
        addClient,
        updateClient,
        deleteClient,
        services,
        addService,
        updateService,
        deleteService,
        toggleServiceActive,
        quotes,
        addQuote,
        updateQuote,
        deleteQuote,
        convertQuoteToInvoice,
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        payments,
        addPayment,
        deletePayment,
        schedules,
        addSchedule,
        payInstallment,
        deleteSchedule,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        markExpensePaid,
        recoveryCases,
        addRecoveryCase,
        updateRecoveryCase,
        deleteRecoveryCase,
        users,
        addUser,
        updateUser,
        deleteUser,
        reminderWorkflows,
        toggleReminderWorkflow,
        auditLogs,
        addAuditLog,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
};

// Re-export so views can keep status helpers handy
export type { ClientStatus };
