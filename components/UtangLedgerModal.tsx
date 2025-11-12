import React, { useEffect, useState } from 'react';

interface LedgerEntry {
  id: string;
  customer: string;
  amount: number; // positive for loan, negative for payment
  note?: string;
  date: string;
}

interface Props {
  storeId: string;
  onClose: () => void;
}

// Lightweight local demo modal for Sari-Sari utang ledger.
const UtangLedgerModal: React.FC<Props> = ({ storeId, onClose }) => {
  const storageKey = `ledger_${storeId}`;
  const [items, setItems] = useState<LedgerEntry[]>([]);
  const [customer, setCustomer] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setItems(raw ? JSON.parse(raw) : []);
    } catch { setItems([]); }
  }, [storageKey]);

  const save = (next: LedgerEntry[]) => {
    setItems(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const addLoan = (sign: 1 | -1) => {
    const val = Number(amount);
    if (!customer.trim() || isNaN(val) || val <= 0) return;
    const entry: LedgerEntry = {
      id: `l_${Date.now()}`,
      customer: customer.trim(),
      amount: sign * val,
      note: note.trim() || undefined,
      date: new Date().toISOString(),
    };
    save([entry, ...items]);
    setAmount('');
    setNote('');
  };

  const balance = items.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold">Utang Ledger</h3>
          <button className="px-3 py-1 rounded-md bg-slate-200 dark:bg-slate-700" onClick={onClose}>Close</button>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <input value={customer} onChange={e=>setCustomer(e.target.value)} placeholder="Customer"
                 className="px-2 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700" />
          <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount"
                 className="px-2 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700" />
          <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Note"
                 className="px-2 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700" />
          <button onClick={() => addLoan(1)} className="px-3 py-2 bg-emerald-600 text-white rounded-md">Add Loan</button>
          <button onClick={() => addLoan(-1)} className="px-3 py-2 bg-sky-600 text-white rounded-md">Add Payment</button>
        </div>
        <div className="mb-2 text-sm">
          Balance: <span className={balance>=0? 'text-amber-600':'text-emerald-600'}>{balance>=0? '₱'+balance.toFixed(2): '₱'+(-balance).toFixed(2)+' credit'}</span>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-700">
          {items.map(e => (
            <div key={e.id} className="py-2 flex items-center justify-between">
              <div>
                <div className="font-semibold">{e.customer}</div>
                <div className="text-xs text-slate-500">{new Date(e.date).toLocaleString()}</div>
                {e.note && <div className="text-xs text-slate-500">{e.note}</div>}
              </div>
              <div className={`text-sm font-semibold ${e.amount>0? 'text-amber-700':'text-emerald-700'}`}>
                {e.amount>0? '+₱'+e.amount.toFixed(2): '-₱'+(-e.amount).toFixed(2)}
              </div>
            </div>
          ))}
          {items.length===0 && <div className="text-sm text-slate-500">No ledger entries yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default UtangLedgerModal;

