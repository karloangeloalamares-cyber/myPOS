import React, { useEffect, useState } from 'react';

interface Appointment {
  id: string;
  customer: string;
  service: string;
  datetime: string; // ISO string
  notes?: string;
}

interface Props {
  storeId: string;
  onClose: () => void;
}

// Lightweight local demo modal to manage salon-style appointments.
const AppointmentsModal: React.FC<Props> = ({ storeId, onClose }) => {
  const storageKey = `appointments_${storeId}`;
  const [items, setItems] = useState<Appointment[]>([]);
  const [customer, setCustomer] = useState('');
  const [service, setService] = useState('Haircut');
  const [datetime, setDatetime] = useState<string>(() => new Date().toISOString().slice(0,16));
  const [notes, setNotes] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setItems(raw ? JSON.parse(raw) : []);
    } catch { setItems([]); }
  }, [storageKey]);

  const save = (next: Appointment[]) => {
    setItems(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const add = () => {
    if (!customer.trim()) return;
    const appt: Appointment = {
      id: `appt_${Date.now()}`,
      customer: customer.trim(),
      service: service.trim(),
      datetime: new Date(datetime).toISOString(),
      notes: notes.trim() || undefined,
    };
    save([appt, ...items]);
    setCustomer('');
    setNotes('');
  };

  const remove = (id: string) => save(items.filter(i => i.id !== id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold">Appointments</h3>
          <button className="px-3 py-1 rounded-md bg-slate-200 dark:bg-slate-700" onClick={onClose}>Close</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
          <input value={customer} onChange={e=>setCustomer(e.target.value)} placeholder="Customer"
                 className="px-2 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700" />
          <select value={service} onChange={e=>setService(e.target.value)}
                  className="px-2 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700">
            <option>Haircut</option>
            <option>Manicure</option>
            <option>Hair Color</option>
            <option>Other</option>
          </select>
          <input type="datetime-local" value={datetime} onChange={e=>setDatetime(e.target.value)}
                 className="px-2 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700" />
          <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes"
                 className="px-2 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700" />
        </div>
        <div className="mb-4">
          <button onClick={add} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Add Appointment</button>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-700">
          {items.map(a => (
            <div key={a.id} className="py-2 flex items-center justify-between">
              <div>
                <div className="font-semibold">{a.customer} • {a.service}</div>
                <div className="text-xs text-slate-500">{new Date(a.datetime).toLocaleString()}</div>
                {a.notes && <div className="text-xs text-slate-500">{a.notes}</div>}
              </div>
              <button className="px-3 py-1 text-sm rounded-md bg-red-100 text-red-700" onClick={()=>remove(a.id)}>Remove</button>
            </div>
          ))}
          {items.length===0 && <div className="text-sm text-slate-500">No appointments yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsModal;

