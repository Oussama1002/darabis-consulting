export type UserRole = 'ADMIN' | 'FINANCIAL_MANAGER' | 'ACCOUNTANT' | 'RECOVERY_AGENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'DEBTOR';

export interface Client {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  status: ClientStatus;
  totalInvoiced: number;
  totalPaid: number;
  balance: number;
  lastPaymentDate?: string;
}

export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface Quote {
  id: string;
  quoteNumber: string;
  clientId: string;
  clientName: string;
  date: string;
  expiryDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: QuoteStatus;
  items: InvoiceItem[];
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  date: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CHECK';

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
}

export interface CollectionAction {
  id: string;
  clientId: string;
  date: string;
  type: 'EMAIL' | 'SMS' | 'CALL' | 'LETTER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  note: string;
}

export interface Schedule {
  id: string;
  clientId: string;
  clientName: string;
  invoiceId: string;
  invoiceNumber: string;
  totalAmount: number;
  remainingAmount: number;
  installments: Installment[];
}

export interface Installment {
  id: string;
  dueDate: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
}

export type ServiceCategory = 'CONSULTING' | 'FORMATION' | 'AUDIT' | 'ACCOMPAGNEMENT' | 'AUTRE';

export interface Service {
  id: string;
  code: string;
  name: string;
  description: string;
  category: ServiceCategory;
  unitPrice: number;
  taxRate: number;
  unit: string;
  active: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  category: string;
  totalSpent: number;
  outstanding: number;
}

export type ExpenseStatus = 'PENDING' | 'PAID' | 'OVERDUE';

export interface Expense {
  id: string;
  reference: string;
  supplierId: string;
  supplierName: string;
  date: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  category: string;
  status: ExpenseStatus;
  paymentMethod?: PaymentMethod;
}

export type RecoveryPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RecoveryCase {
  id: string;
  clientId: string;
  clientName: string;
  invoiceId: string;
  invoiceNumber: string;
  amountDue: number;
  daysOverdue: number;
  priority: RecoveryPriority;
  assignedTo: string;
  lastAction: string;
  lastActionDate: string;
  nextAction: string;
  notes: string;
}
