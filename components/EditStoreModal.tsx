import React, { useEffect, useState } from 'react';
import { Store } from '../types';
import { storeService } from '../services/storeService';
import PhilippineAddressSelector, { type AddressValue } from './PhilippineAddressSelector';
import { businessPlans, type PlanKey } from '@/config/businessPlans';
import { getModules, setModule, FREE_PLAN, PREMIUM_PLAN } from '@/services/moduleService';

interface EditStoreModalProps {
  store: Store;
  onClose: () => void;
  onStoreUpdated: (store: Store) => void;
}

export default function EditStoreModal({ store, onClose, onStoreUpdated }: EditStoreModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: store.name,
    ownerFirstName: '',
    ownerMiddleName: '',
    ownerLastName: '',
    phone: store.phone,
    email: store.email,
    taxRate: store.settings.taxRate,
    lowStockThreshold: store.settings.lowStockThreshold,
    timezone: store.settings.timezone,
    currency: store.settings.currency,
    enabled: store.enabled,
  });
  // Initialize owner fields from existing ownerName
  useEffect(() => {
    const full = (store.ownerName || '').trim();
    if (!full) return;
    const parts = full.split(/\s+/);
    if (parts.length === 1) {
      setFormData(prev => ({ ...prev, ownerFirstName: parts[0] }));
    } else if (parts.length === 2) {
      setFormData(prev => ({ ...prev, ownerFirstName: parts[0], ownerLastName: parts[1] }));
    } else {
      const first = parts[0];
      const last = parts[parts.length - 1];
      const middle = parts.slice(1, -1).join(' ');
      setFormData(prev => ({ ...prev, ownerFirstName: first, ownerMiddleName: middle, ownerLastName: last }));
    }
  }, [store.ownerName]);

  // Address and modules states
  const [address, setAddress] = useState<AddressValue>({});
  const [street, setStreet] = useState<string>(store.addressStructured?.street || store.address || '');
  const [plan, setPlan] = useState<'Starter' | 'Pro' | 'Scale'>('Starter');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  useEffect(() => {
    getModules(store.id)
      .then(map => {
        const arr = Object.entries(map).filter(([,v])=>!!v).map(([k])=>k);
        setSelectedModules(arr);
        if (arr.includes('multi_branch')) setPlan('Scale');
        else if (arr.includes('clients') || arr.includes('appointments') || arr.includes('loyalty')) setPlan('Pro');
        else setPlan('Starter');
      })
      .catch(() => setSelectedModules(Object.entries(FREE_PLAN).filter(([,v])=>v).map(([k])=>k)));
  }, [store.id]);

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'Pacific/Honolulu',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Hong_Kong',
    'Australia/Sydney',
  ];

  const currencies = ['USD', 'PHP', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'SGD', 'HKD'];

  // Helpers similar to CreateStoreModal
  const getAllModuleIds = () => {
    const set = new Set<string>([...Object.keys(FREE_PLAN), ...Object.keys(PREMIUM_PLAN)]);
    Object.values(businessPlans).forEach((plans) => {
      Object.values(plans).forEach((arr) => arr.forEach((m) => set.add(m)));
    });
    return Array.from(set);
  };

  function seedModulesForPlan(businessType: string, planKey: PlanKey, set: (mods: string[]) => void) {
    const typeKey = (businessType || 'retail').toLowerCase();
    const plans = (businessPlans as any)[typeKey] ?? businessPlans.retail;
    set(plans[planKey] || []);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Store name is required');
      return;
    }
    if (!street.trim()) { setError('Street address is required'); return; }
    if (!formData.phone.trim()) {
      setError('Contact phone is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Contact email is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const ownerFullName = [formData.ownerFirstName.trim(), formData.ownerMiddleName.trim(), formData.ownerLastName.trim()].filter(Boolean).join(' ');

      const updatedStore: Store = {
        ...store,
        name: formData.name.trim(),
        address: street.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        ownerName: ownerFullName,
        enabled: formData.enabled,
        settings: {
          ...store.settings,
          storeName: formData.name.trim(),
          storeAddress: [address.barangay?.brgy_name, address.city?.city_name, address.province?.province_name].filter(Boolean).join(', '),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          taxRate: formData.taxRate,
          lowStockThreshold: formData.lowStockThreshold,
          timezone: formData.timezone,
          currency: formData.currency,
        },
        addressStructured: {
          street: street.trim(),
          province: address.province?.province_name || store.addressStructured?.province || '',
          city: address.city?.city_name || store.addressStructured?.city || '',
          barangay: address.barangay?.brgy_name || store.addressStructured?.barangay || '',
        },
        updatedAt: new Date(),
      };

      // Call service to update store
      const savedStore = await storeService.updateStore(store.id, updatedStore);
      // Save modules according to selection
      try {
        const all = Array.from(new Set<string>([...Object.keys(FREE_PLAN), ...Object.keys(PREMIUM_PLAN), ...Object.values(businessPlans).flatMap(p => Object.values(p).flat())]));
        const finalMap: Record<string, boolean> = {};
        all.forEach(m => { finalMap[m] = selectedModules.includes(m); });
        await Promise.all(Object.entries(finalMap).map(([name, enabled]) => setModule(store.id, name as any, !!enabled)));
      } catch {}
      onStoreUpdated(savedStore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Edit Store</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 transition disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Store Code (Read-only) */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-1">
              Store Code
            </label>
            <input
              type="text"
              id="code"
              value={store.code}
              disabled={true}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">Store codes cannot be changed</p>
          </div>

          {/* Store Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Store Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition"
            />
          </div>

          {/* Owner Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Owner First Name *</nlabel>
              <input name="ownerFirstName" value={formData.ownerFirstName} onChange={handleChange} disabled={loading} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Middle Name</label>
              <input name="ownerMiddleName" value={formData.ownerMiddleName} onChange={handleChange} disabled={loading} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
              <input name="ownerLastName" value={formData.ownerLastName} onChange={handleChange} disabled={loading} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition" />
            </div>
          </div>

          {/* PH Address + Street */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PhilippineAddressSelector value={address} onChange={setAddress} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Street Address *</label>
              <input type="text" value={street} onChange={(e)=> setStreet(e.target.value)} disabled={loading} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition" />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
              Contact Phone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Contact Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition"
            />
          </div>

          {/* Timezone */}
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-slate-700 mb-1">
              Timezone
            </label>
            <select
              id="timezone"
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition"
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          {/* Currency */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-slate-700 mb-1">
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition"
            >
              {currencies.map(cur => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>
          </div>

          {/* Tax Rate */}
          <div>
            <label htmlFor="taxRate" className="block text-sm font-medium text-slate-700 mb-1">
              Tax Rate (%) 
            </label>
            <input
              type="number"
              id="taxRate"
              name="taxRate"
              value={formData.taxRate}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              disabled={loading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition"
            />
          </div>

          {/* Low Stock Threshold */}
          <div>
            <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-slate-700 mb-1">
              Low Stock Threshold
            </label>
            <input
              type="number"
              id="lowStockThreshold"
              name="lowStockThreshold"
              value={formData.lowStockThreshold}
              onChange={handleChange}
              min="0"
              step="1"
              disabled={loading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition"
            />
          </div>

          {/* Enabled Toggle */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <input
              type="checkbox"
              id="enabled"
              name="enabled"
              checked={formData.enabled}
              onChange={handleChange}
              disabled={loading}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
            <label htmlFor="enabled" className="text-sm font-medium text-slate-700 cursor-pointer">
              Store is Active
            </label>
          </div>

          {/* Modules + Plan seeding */}
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-700">Modules</div>
              <div className="flex items-center gap-2">
                <button type="button" className={`px-2 py-1 rounded ${plan==='Starter'?'bg-slate-800 text-white':'bg-slate-100'}`} onClick={()=>{ setPlan('Starter'); seedModulesForPlan(store.businessType || 'retail','starter', setSelectedModules); }}>Seed Starter</button>
                <button type="button" className={`px-2 py-1 rounded ${plan==='Pro'?'bg-amber-500 text-white':'bg-amber-100'}`} onClick={()=>{ setPlan('Pro'); seedModulesForPlan(store.businessType || 'retail','pro', setSelectedModules); }}>Seed Pro</button>
                <button type="button" className={`px-2 py-1 rounded ${plan==='Scale'?'bg-emerald-500 text-white':'bg-emerald-100'}`} onClick={()=>{ setPlan('Scale'); seedModulesForPlan(store.businessType || 'retail','scale', setSelectedModules); }}>Seed Scale</button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {getAllModuleIds().map(key => (
                <label key={key} className="flex items-center gap-2">
                  <input type="checkbox" checked={selectedModules.includes(key)} onChange={(e)=> setSelectedModules(prev => e.target.checked ? Array.from(new Set([...prev, key])) : prev.filter(m => m !== key))} />
                  <span className="capitalize">{key.replace('_',' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
