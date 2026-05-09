import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal, DangerButton, SecondaryButton, PrimaryButton } from './Modal';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmContextValue {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<{ opts: ConfirmOptions; resolve: (v: boolean) => void } | null>(null);

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setState({ opts, resolve });
      }),
    []
  );

  const close = (val: boolean) => {
    state?.resolve(val);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Modal
        open={!!state}
        onClose={() => close(false)}
        title={state?.opts.title || ''}
        size="sm"
        footer={
          <>
            <SecondaryButton onClick={() => close(false)}>
              {state?.opts.cancelLabel || 'Annuler'}
            </SecondaryButton>
            {state?.opts.danger ? (
              <DangerButton onClick={() => close(true)}>
                {state?.opts.confirmLabel || 'Confirmer'}
              </DangerButton>
            ) : (
              <PrimaryButton onClick={() => close(true)}>
                {state?.opts.confirmLabel || 'Confirmer'}
              </PrimaryButton>
            )}
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl ${
              state?.opts.danger ? 'bg-red-50 text-red-600' : 'bg-darbis-blue/5 text-darbis-blue'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-600 leading-relaxed flex-1">{state?.opts.message}</p>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider');
  return ctx;
};
