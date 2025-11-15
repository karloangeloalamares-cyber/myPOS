import React, { useEffect, useMemo, useState } from 'react';
import { SettingsData, Store, Staff, StaffRole } from '../types';
import { ModuleMap } from '@/services/moduleService';
import { staffService } from '../services/staffService';
import { useConfirm } from './ConfirmProvider';
import { getOwnerForStore } from '../services/localAuth';

interface SettingsProps {
  settings: SettingsData;
  store: Store;
  modules: ModuleMap;
  staff: Staff[];
  onSave: (newSettings: SettingsData) => void;
  onStaffsChanged: (staff: Staff[]) => void;
}

const Settings: React.FC<SettingsProps> = ({
  settings,
  store,
  modules,
  staff,
  onSave,
  onStaffsChanged,
}) => {
  const [formData, setFormData] = useState<SettingsData>(settings);
  const owner = getOwnerForStore(store.id);
  const [storeStaff, setStoreStaff] = useState<Staff[]>(() =>
    staff.filter(s => s.storeIds.includes(store.id))
  );
  const [staffFirstName, setStaffFirstName] = useState('');
  const [staffMiddleName, setStaffMiddleName] = useState('');
  const [staffLastName, setStaffLastName] = useState('');
  const [staffNickname, setStaffNickname] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState<StaffRole>('STAFF');
  const [staffActive, setStaffActive] = useState(true);
  const [staffModules, setStaffModules] = useState<string[]>([]);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const confirm = useConfirm();

  const availableModules = useMemo(
    () => Object.entries(modules).filter(([, enabled]) => enabled).map(([key]) => key),
    [modules]
  );

  useEffect(() => {
    setStoreStaff(staff.filter(s => s.storeIds.includes(store.id)));
  }, [staff, store.id]);

  useEffect(() => {
    setStaffModules(prev => prev.filter(mod => availableModules.includes(mod)));
  }, [availableModules]);

  const resetStaffForm = () => {
    setStaffFirstName('');
    setStaffMiddleName('');
    setStaffLastName('');
    setStaffNickname('');
    setStaffPhone('');
    setStaffRole('STAFF');
    setStaffActive(true);
    setStaffModules([]);
    setEditingStaffId(null);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      taxRate: Number(formData.taxRate) || 0,
      lowStockThreshold: Number(formData.lowStockThreshold) || 0,
    });
  };

  const startEditingStaff = (entry: Staff) => {
    const parts = entry.name.split(/\s+/);
    const first = parts[0] || '';
    const last = parts.length === 1 ? '' : parts[parts.length - 1];
    const middle = parts.length > 2 ? parts.slice(1, -1).join(' ') : '';
    setStaffFirstName(first);
    setStaffMiddleName(middle);
    setStaffLastName(last);
    setStaffNickname(entry.nickname || '');
    setStaffPhone(entry.contactPhone || '');
    setStaffRole(entry.role);
    setStaffActive(entry.isActive);
    setStaffModules(entry.modules ? entry.modules.filter(mod => availableModules.includes(mod)) : []);
    setEditingStaffId(entry.id);
  };

  const handleStaffSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFirstName.trim() || !staffLastName.trim()) return;
    const fullName = [staffFirstName.trim(), staffMiddleName.trim(), staffLastName.trim()]
      .filter(Boolean)
      .join(' ');
    const payload: Omit<Staff, 'id' | 'createdAt'> = {
      name: fullName,
      nickname: staffNickname.trim() || undefined,
      role: staffRole,
      storeIds: [store.id],
      contactPhone: staffPhone.trim() || undefined,
      isActive: staffActive,
      modules: staffModules,
    };
    if (editingStaffId) {
      const updated = staffService.update(editingStaffId, payload);
      if (updated) {
        setStoreStaff(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      }
    } else {
      const created = staffService.create(payload);
      setStoreStaff(prev => [...prev, created]);
    }
    onStaffsChanged(staffService.getAll());
    resetStaffForm();
  };

  const handleStaffDelete = async (entry: Staff) => {
    try {
      await confirm({
        message: `You are about to delete ${entry.name}. This action cannot be undone.`,
        confirmButtonLabel: 'Delete Staff',
      });
      staffService.delete(entry.id);
      const updated = staffService.getAll();
      setStoreStaff(updated.filter(s => s.storeIds.includes(store.id)));
      onStaffsChanged(updated);
      if (editingStaffId === entry.id) resetStaffForm();
    } catch {}
  };

  const toggleStaffActive = (id: string, next: boolean) => {
    const updated = staffService.update(id, { isActive: next });
    if (updated) {
      const normalized = staffService.getAll();
      setStoreStaff(normalized.filter(s => s.storeIds.includes(store.id)));
      onStaffsChanged(normalized);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'taxRate' || name === 'lowStockThreshold' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => window.history.back()}
          className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600"
        >
          ← Back
        </button>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-6">Store Settings</h2>
      </div>

      <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 sm:p-8 space-y-6">
        <FormInput label="Store Name" name="storeName" value={formData.storeName} onChange={handleInputChange} required />
        <FormInput label="Store Address" name="storeAddress" value={formData.storeAddress} onChange={handleInputChange} />
        <FormInput label="Contact Info (Email or Phone)" name="contactInfo" value={formData.contactInfo} onChange={handleInputChange} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput label="Tax Rate (%)" name="taxRate" type="number" value={formData.taxRate} onChange={handleInputChange} required min="0" step="0.01" />
          <FormInput label="Low Stock Threshold" name="lowStockThreshold" type="number" value={formData.lowStockThreshold} onChange={handleInputChange} required min="0" step="1" />
        </div>
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Settings
          </button>
        </div>
      </form>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Manage Staff</h3>
          <span className="text-sm text-slate-500">Only staff assigned to this store are listed.</span>
        </div>
        <form onSubmit={handleStaffSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormInput label="First Name *" name="staffFirstName" value={staffFirstName} onChange={(e) => setStaffFirstName(e.target.value)} />
          <FormInput label="Middle Name" name="staffMiddleName" value={staffMiddleName} onChange={(e) => setStaffMiddleName(e.target.value)} />
          <FormInput label="Last Name *" name="staffLastName" value={staffLastName} onChange={(e) => setStaffLastName(e.target.value)} />
          <FormInput label="Nickname" name="staffNickname" value={staffNickname} onChange={(e) => setStaffNickname(e.target.value)} />
          <FormInput label="Contact Phone" name="staffPhone" value={staffPhone} onChange={(e) => setStaffPhone(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
            <select className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 dark:text-slate-200" value={staffRole} onChange={(e) => setStaffRole(e.target.value as StaffRole)}>
              <option value="STAFF">Staff</option>
              <option value="CASHIER">Cashier</option>
              <option value="THERAPIST">Therapist</option>
              <option value="BARBER">Barber</option>
              <option value="WAITER">Waiter</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Module Access (limited to enabled modules)</p>
            <div className="flex flex-wrap gap-2">
              {availableModules.map(key => (
                <label key={key} className="inline-flex items-center gap-2 px-2 py-1 border rounded-full text-xs bg-white dark:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={staffModules.includes(key)}
                    onChange={e => setStaffModules(prev => e.target.checked ? Array.from(new Set([...prev, key])) : prev.filter(m => m !== key))}
                  />
                  <span>{key.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={staffActive} onChange={(e) => setStaffActive(e.target.checked)} />
            <span className="text-sm text-slate-600 dark:text-slate-400">Active</span>
          </div>
          <div className="md:col-span-3 flex items-center justify-between">
            {editingStaffId && (
              <button type="button" onClick={resetStaffForm} className="px-4 py-2 border rounded-md text-sm">
                Cancel
              </button>
            )}
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              {editingStaffId ? 'Save Changes' : 'Add Staff'}
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Modules</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {storeStaff.map(entry => (
                <tr key={entry.id}>
                  <td className="px-4 py-2 text-sm">{entry.name}{entry.nickname ? ` (${entry.nickname})` : ''}</td>
                  <td className="px-4 py-2 text-sm">{entry.role}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1 text-xs">
                      {entry.modules?.length ? entry.modules.map(m => (
                        <span key={m} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100">{m.replace('_', ' ')}</span>
                      )) : <span className="text-slate-400">No modules</span>}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm">{entry.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button type="button" onClick={() => startEditingStaff(entry)} className="px-3 py-1.5 text-xs rounded-md border bg-white hover:bg-slate-50">Edit</button>
                    <button type="button" onClick={() => handleStaffDelete(entry)} className="px-3 py-1.5 text-xs rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100">Delete</button>
                    <button type="button" onClick={() => toggleStaffActive(entry.id, !entry.isActive)} className="px-3 py-1.5 text-xs rounded-md border bg-white hover:bg-slate-50">
                      {entry.isActive ? 'Mark Inactive' : 'Mark Active'}
                    </button>
                  </td>
                </tr>
              ))}
              {storeStaff.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-sm text-slate-500 text-center">No staff assigned to this store yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, name, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
    <input
      id={name}
      name={name}
      {...props}
      className="mt-1 block w-full h-11 rounded-lg border-2 border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 px-3"
    />
  </div>
);

export default Settings;
