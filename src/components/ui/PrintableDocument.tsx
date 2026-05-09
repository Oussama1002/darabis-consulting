import React from 'react';
import { Quote, Invoice, Payment } from '../../types';
import { formatCurrency, formatDate, paymentMethodLabel } from '../../lib/utils';

interface DocProps {
  type: 'QUOTE' | 'INVOICE' | 'RECEIPT';
  document: Quote | Invoice | (Payment & { invoiceTotal?: number });
}

export const PrintableDocument: React.FC<DocProps> = ({ type, document }) => {
  const isReceipt = type === 'RECEIPT';
  const title = type === 'QUOTE' ? 'DEVIS' : type === 'INVOICE' ? 'FACTURE' : 'REÇU DE PAIEMENT';
  const ref =
    type === 'QUOTE'
      ? (document as Quote).quoteNumber
      : type === 'INVOICE'
      ? (document as Invoice).invoiceNumber
      : `REC-${(document as Payment).id}`;

  return (
    <div className="bg-white p-12 print:p-8 max-w-3xl mx-auto" id="printable-document">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-document, #printable-document * { visibility: visible; }
          #printable-document { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div className="flex justify-between items-start mb-12 pb-8 border-b-2 border-slate-200">
        <div>
          <div className="w-16 h-16 bg-darbis-green rounded-xl flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">DB</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Bureau Darbis Consulting</h1>
          <p className="text-sm text-slate-500">Casablanca, Maroc</p>
          <p className="text-sm text-slate-500">contact@darbis.ma · +212 522 00 00 00</p>
          <p className="text-sm text-slate-500">ICE : 002345678000012</p>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-darbis-blue tracking-wider">{title}</h2>
          <p className="text-lg font-bold text-slate-700 mt-2">{ref}</p>
          <p className="text-sm text-slate-500 mt-2">
            {!isReceipt && `Date : ${formatDate((document as Quote | Invoice).date)}`}
            {isReceipt && `Date : ${formatDate((document as Payment).date)}`}
          </p>
          {type === 'INVOICE' && (
            <p className="text-sm text-slate-500">Échéance : {formatDate((document as Invoice).dueDate)}</p>
          )}
          {type === 'QUOTE' && (
            <p className="text-sm text-slate-500">Validité : {formatDate((document as Quote).expiryDate)}</p>
          )}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-8">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Adressé à</p>
          <h3 className="text-lg font-bold text-slate-900">
            {(document as any).clientName || (document as Payment).clientName}
          </h3>
        </div>
      </div>

      {!isReceipt && (
        <table className="w-full mb-8">
          <thead>
            <tr className="bg-slate-100">
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Description</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Qté</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Prix HT</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody>
            {(document as Quote | Invoice).items.map((it) => (
              <tr key={it.id} className="border-b border-slate-100">
                <td className="px-4 py-3 text-sm text-slate-700">{it.description}</td>
                <td className="px-4 py-3 text-sm text-slate-700 text-center">{it.quantity}</td>
                <td className="px-4 py-3 text-sm text-slate-700 text-right">{formatCurrency(it.unitPrice)}</td>
                <td className="px-4 py-3 text-sm font-bold text-slate-900 text-right">{formatCurrency(it.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!isReceipt && (
        <div className="flex justify-end mb-8">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Sous-total HT</span>
              <span className="font-semibold">{formatCurrency((document as Quote | Invoice).amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">TVA</span>
              <span className="font-semibold">{formatCurrency((document as Quote | Invoice).taxAmount)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t-2 border-slate-200">
              <span className="font-bold text-slate-900">Total TTC</span>
              <span className="font-bold text-xl text-darbis-blue">
                {formatCurrency((document as Quote | Invoice).totalAmount)}
              </span>
            </div>
          </div>
        </div>
      )}

      {isReceipt && (
        <div className="bg-slate-50 rounded-xl p-8 mb-8">
          <p className="text-sm text-slate-600 mb-4">
            Reçu pour le paiement de la facture <strong>{(document as Payment).invoiceNumber}</strong>
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mode de paiement</p>
              <p className="text-lg font-bold text-slate-900">{paymentMethodLabel((document as Payment).method)}</p>
              {(document as Payment).reference && (
                <p className="text-xs text-slate-500 mt-1">Réf : {(document as Payment).reference}</p>
              )}
              {(document as Payment).notes && (
                <p className="text-xs text-slate-500 mt-2">Note : {(document as Payment).notes}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Montant</p>
              <p className="text-3xl font-bold text-darbis-green">
                {formatCurrency((document as Payment).amount)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 pt-8 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-400">
          {type === 'QUOTE' && 'Ce devis est valable jusqu\'à la date indiquée. Pour acceptation, retournez-le signé.'}
          {type === 'INVOICE' && 'Conditions : paiement à 30 jours. TVA non applicable, art. 293 B du CGI.'}
          {isReceipt && 'Ce reçu fait foi du règlement effectué.'}
        </p>
        <p className="text-[10px] text-slate-300 mt-2">Bureau Darbis Consulting · ICE 002345678000012</p>
      </div>
    </div>
  );
};

export const printDocument = () => {
  window.print();
};
