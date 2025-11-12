import React, { useEffect, useState } from 'react';

interface Ticket {
  id: string;
  customer: string;
  description: string;
  status: 'open' | 'in-progress' | 'done';
  createdAt: string;
}

interface Props {
  storeId: string;
  onClose: () => void;
}

// Lightweight local demo modal for tickets/queue (laundry/salon/restaurant).
const TicketsModal: React.FC<Props> = ({ storeId, onClose }) => {
  const storageKey = `tickets_${storeId}`;
  const [items, setItems] = useState<Ticket[]>([]);
  const [customer, setCustomer] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setItems(raw ? JSON.parse(raw) : []);
    } catch { setItems([]); }
  }, [storageKey]);

  const save = (next: Ticket[]) => {
    setItems(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const add = () => {
    if (!customer.trim() || !description.trim()) return;
    const t: Ticket = {
      id: `t_${Date.now()}`,
      customer: customer.trim(),
      description: description.trim(),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    save([t, ...items]);
    setCustomer('');
    setDescription('');
  };

  const setStatus = (id: string, status: Ticket['status']) => {
    save(items.map(t => t.id === id ? { ...t, status } : t));
  };
  const remove = (id: string) => save(items.filter(t => t.id !== id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold">Tickets / Queue</h3>
          <button className="px-3 py-1 rounded-md bg-slate-200 dark:bg-slate-700" onClick={onClose}>Close</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
          <input value={customer} onChange={e=>setCustomer(e.target.value)} placeholder="Customer"
                 className="px-2 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700" />
          <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description"
                 className="px-2 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700" />
          <button onClick={add} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Add Ticket</button>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-700">
          {items.map(t => (
            <div key={t.id} className="py-2 flex items-center justify-between">
              <div>
                <div className="font-semibold">{t.customer} • {t.description}</div>
                <div className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <select value={t.status} onChange={e=>setStatus(t.id, e.target.value as any)}
                        className="px-2 py-1 rounded-md border dark:bg-slate-900 dark:border-slate-700 text-sm">
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <button className="px-3 py-1 text-sm rounded-md bg-red-100 text-red-700" onClick={()=>remove(t.id)}>Remove</button>
              </div>
            </div>
          ))}
          {items.length===0 && <div className="text-sm text-slate-500">No tickets yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default TicketsModal;

