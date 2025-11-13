import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ConfirmDeleteItemsModal from './ConfirmDeleteItemsModal';

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmWord?: string; // default 'DELETE'
  confirmButtonLabel?: string; // default 'Confirm'
};

type ConfirmFn = (opts: ConfirmOptions) => Promise<void>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}

export default function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<(() => void) | null>(null);
  const [rejecter, setRejecter] = useState<(() => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((o) => {
    setOpts(o);
    setOpen(true);
    return new Promise<void>((resolve, reject) => {
      setResolver(() => resolve);
      setRejecter(() => reject);
    });
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setOpts(null);
    if (rejecter) rejecter();
    setResolver(null);
    setRejecter(null);
  }, [rejecter]);

  const handleConfirm = useCallback(() => {
    setOpen(false);
    if (resolver) resolver();
    setResolver(null);
    setRejecter(null);
    setOpts(null);
  }, [resolver]);

  const value = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {open && opts && (
        <ConfirmDeleteItemsModal
          title={opts.title || 'Please Confirm'}
          message={opts.message}
          confirmWord={opts.confirmWord || 'DELETE'}
          confirmButtonLabel={opts.confirmButtonLabel || 'Confirm'}
          onClose={handleClose}
          onConfirm={handleConfirm}
        />
      )}
    </ConfirmContext.Provider>
  );
}

