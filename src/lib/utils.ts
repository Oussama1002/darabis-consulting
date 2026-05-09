import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Installment, PaymentMethod } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function paymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    CASH: 'Espèces',
    TRANSFER: 'Virement',
    CHECK: 'Chèque',
    CARD: 'Carte bancaire',
    OTHER: 'Autre',
  };
  return labels[method];
}

/** Statut affiché : une échéance en attente dont la date est passée est considérée en retard. */
export function installmentEffectiveStatus(inst: Installment): Installment['status'] {
  if (inst.status === 'PAID') return 'PAID';
  const due = new Date(inst.dueDate);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  if (due < today) return 'OVERDUE';
  return 'PENDING';
}

export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
