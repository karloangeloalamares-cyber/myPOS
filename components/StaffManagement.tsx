import React, { useMemo, useState } from 'react';
import { Staff, StaffRole, Store } from '../types';
import { staffService } from '../services/staffService';
import { useConfirm } from './ConfirmProvider';

interface StaffManagementProps {
  stores: Store[];
}

const roleOptions: StaffRole[] = ['STAFF', 'CASHIER', 'THERAPIST', 'BARBER', 'WAITER', 'OTHER'];

const StaffManagement: React.FC<StaffManagementProps> = ({ stores }) => {
  const [staff, setStaff] = useState<Staff[]>(() => staffService.getAll());
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState<StaffRole>('STAFF');
  const [storeIds, setStoreIds] = useState<string[]>([]);
  const [contactPhone, setContactPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const confirm = useConfirm();

  const storeMap = useMemo(() => {
    const m = new Map<string, string>();
    stores.forEach(s => m.set(s.id, s.name));
    return m;
  }, [stores]);

  const resetForm = () => {
    setFirstName('');
    setMiddleName('');
    setLastName('');
    setNickname('');
    setRole('STAFF');
    setStoreIds([]);
    setContactPhone('');
    setIsActive(true);
  };

  const toggleStore = (id: string) => {
    setStoreIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      alert('First name is required');
      return;
    }
    if (!lastName.trim()) {
      alert('Last name is required');
      return;
    }
    const fullName = [firstName.trim(), middleName.trim(), lastName.trim()].filter(Boolean).join(' ');
    const created = staffService.create({
      name: fullName,
      nickname: nickname.trim() || undefined,
      role,
      storeIds: [...storeIds],
      contactPhone: contactPhone.trim() || undefined,
      isActive,
    });
    setStaff(prev => [...prev, created]);
    resetForm();
  };

  const handleToggleActive = (id: string, next: boolean) => {
    const updated = staffService.update(id, { isActive: next });
    if (updated) setStaff(prev => prev.map(s => s.id === id ? updated : s));
  };

  const handleSoftDelete = async (id: string) => {
    const target = staff.find(s => s.id === id);
    if (!target) return;
    try {
      await confirm({
        title: 'Confirm Soft Delete',
        message: `You are about to mark "${target.name}" as inactive. This can be reverted later.`,
        confirmButtonLabel: 'Mark Inactive',
      });
      handleToggleActive(target.id, false);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Add Staff</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">First Name *</label>
            <input className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" value={firstName} onChange={e => setFirstName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Middle Name</label>
            <input className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" value={middleName} onChange={e => setMiddleName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Last Name *</label>
            <input className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" value={lastName} onChange={e => setLastName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Nickname</label>
            <input className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" value={nickname} onChange={e => setNickname(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Role</label>
            <select className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" value={role} onChange={e => setRole(e.target.value as StaffRole)}>
              {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Contact Phone</label>
            <input className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Assign Stores</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {stores.map(s => (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={storeIds.includes(s.id)} onChange={() => toggleStore(s.id)} />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
            <span className="text-sm text-slate-700 dark:text-slate-300">Active</span>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Add Staff</button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">All Staff</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stores</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {staff.map(s => (
                <tr key={s.id}>
                  <td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200">{s.name}{s.nickname ? ` (${s.nickname})` : ''}</td>
                  <td className="px-6 py-4 text-sm">{s.role}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {s.storeIds.map(id => (
                        <span key={id} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-xs rounded">
                          {storeMap.get(id) || id}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{s.contactPhone || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleToggleActive(s.id, !s.isActive)} className="px-3 py-1.5 text-xs rounded-md border bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600">
                      {s.isActive ? 'Mark Inactive' : 'Mark Active'}
                    </button>
                    <button onClick={() => handleSoftDelete(s.id)} className="ml-2 px-3 py-1.5 text-xs rounded-md border bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600">
                      Soft Delete
                    </button>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">No staff yet. Add your first staff above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Confirmation handled globally via ConfirmProvider */}
    </div>
  );
};

export default StaffManagement;
