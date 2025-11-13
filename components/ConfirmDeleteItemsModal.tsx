import React, { useState } from 'react';

type Props = {
  title?: string;
  message: string;
  confirmWord?: string; // default: DELETE
  confirmButtonLabel?: string; // default: Delete
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
};

export default function ConfirmDeleteItemsModal({ title = 'Confirm Deletion', message, confirmWord = 'DELETE', confirmButtonLabel = 'Delete', onConfirm, onClose }: Props) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setError('');
    if (text.trim() !== confirmWord) {
      setError(`Type ${confirmWord} to confirm.`);
      return;
    }
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-xl">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-slate-700 dark:text-slate-300">{message}</p>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Type {confirmWord} to confirm</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 border rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            placeholder={confirmWord}
            disabled={loading}
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-60">Cancel</button>
          <button onClick={handleConfirm} disabled={loading} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60">{loading ? 'Deleting...' : confirmButtonLabel}</button>
        </div>
      </div>
    </div>
  );
}

