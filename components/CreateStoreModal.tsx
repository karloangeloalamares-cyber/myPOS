import React, { useMemo, useState } from 'react';
import { Store, BusinessType } from '../types';
import { storeService } from '../services/storeService';
import { createOwnerForStore } from '../services/localAuth';
import { PH_PROVINCES } from '../src/data/philippinesLocations';
import { FREE_PLAN, PREMIUM_PLAN, seedForPlan, setModule } from '@/services/moduleService';
import { BUSINESS_MODULE_PRESETS } from '@/config/businessModulePresets';

interface CreateStoreModalProps {
  onClose: () => void;
  onStoreCreated: (store: Store) => void;
}

export default function CreateStoreModal({ onClose, onStoreCreated }: CreateStoreModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState<'Free'|'Premium'>('Free');
  const [modules, setModules] = useState<Record<string, boolean>>({ ...FREE_PLAN });
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    // Location fields are handled via separate state below
    contactPhone: '',
    contactEmail: '',
    timezone: 'UTC',
    businessType: 'RESTAURANT' as BusinessType,
    ownerPassword: '',
  });

  // Cascading location state (Province -> City/Municipality -> Barangay)
  const [provinceCode, setProvinceCode] = useState('');
  const [cityCode, setCityCode] = useState('');
  const [barangayCode, setBarangayCode] = useState('');
  const [street, setStreet] = useState('');

  const provinces = PH_PROVINCES;
  const cities = useMemo(() => {
    const p = provinces.find(p => p.code === provinceCode);
    return p ? p.cities : [];
  }, [provinceCode, provinces]);
  const barangays = useMemo(() => {
    const c = cities.find(c => c.code === cityCode);
    return c ? c.barangays : [];
  }, [cityCode, cities]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Store name is required');
      return;
    }
    if (!formData.owner.trim()) {
      setError('Owner is required');
      return;
    }
    if (!provinceCode) {
      setError('Province is required');
      return;
    }
    if (!cityCode) {
      setError('City / Municipality is required');
      return;
    }
    if (!barangayCode) {
      setError('Barangay is required');
      return;
    }
    if (!street.trim()) {
      setError('Street address is required');
      return;
    }
    if (!formData.contactPhone.trim()) {
      setError('Contact phone is required');
      return;
    }
    if (!formData.contactEmail.trim()) {
      setError('Contact email is required');
      return;
    }
    if (!formData.ownerPassword.trim()) {
      setError('Owner password is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const province = provinces.find(p => p.code === provinceCode);
      const city = cities.find(c => c.code === cityCode);
      const barangay = barangays.find(b => b.code === barangayCode);

      const newStore: Store = {
        id: `store_${Date.now()}`,
        name: formData.name.trim(),
        code: `STORE${Date.now().toString().slice(-4)}`,
        // Migration-safe: keep legacy contact fields while adding structured
        address: street.trim(),
        phone: formData.contactPhone.trim(),
        email: formData.contactEmail.trim(),
        ownerName: formData.owner.trim(),
        contactPhone: formData.contactPhone.trim(),
        contactEmail: formData.contactEmail.trim(),
        addressStructured: {
          street: street.trim(),
          province: province?.name || '',
          city: city?.name || '',
          barangay: barangay?.name || '',
        },
        businessType: formData.businessType,
        enabled: true,
        settings: {
          storeName: formData.name.trim(),
          // Second line of address for display: Barangay, City, Province
          storeAddress: [
            barangay?.name,
            city?.name,
            province?.name,
          ].filter(Boolean).join(', '),
          contactInfo: formData.owner.trim(),
          phone: formData.contactPhone.trim(),
          email: formData.contactEmail.trim(),
          taxRate: 0,
          lowStockThreshold: 10,
          currency: 'USD',
          timezone: formData.timezone,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Call service to save store
      const savedStore = await storeService.createStore(newStore);
      // Provision initial owner record (login still disabled globally)
      const ownerUser = createOwnerForStore(savedStore, {
        name: formData.owner.trim(),
        email: formData.contactEmail.trim(),
        phone: formData.contactPhone.trim(),
        password: formData.ownerPassword,
      });
      try {
        await storeService.updateStore(savedStore.id, { managerId: ownerUser.id });
      } catch {}
      try {
        await seedForPlan(savedStore.id, plan === 'Premium' ? 'premium' : 'free');
        const vertical = (BUSINESS_MODULE_PRESETS as any)[formData.businessType] || [];
        const merged: Record<string, boolean> = { ...(modules as any) };
        (vertical as string[]).forEach((m: string) => { merged[m] = true; });
        const entries = Object.entries(merged);
        await Promise.all(entries.map(([name, enabled]) => setModule(savedStore.id, name as any, !!enabled)));
      } catch {}
      onStoreCreated(savedStore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-[95vw] max-w-3xl sm:max-w-4xl lg:max-w-5xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Create New Store</h2>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}
          {/* Two-column responsive layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column: basic store info */}
            <div className="space-y-4">
              {/* Store Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Store Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Main Branch"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition"
                />
              </div>

              {/* Owner */}
              <div>
                <label htmlFor="owner" className="block text-sm font-medium text-slate-700 mb-1">Owner *</label>
                <input
                  type="text"
                  id="owner"
                  name="owner"
                  value={formData.owner}
                  onChange={handleChange}
                  placeholder="e.g., Juan Dela Cruz"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-slate-700 mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="e.g., +63 912 345 6789"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition"
                />
              </div>

              {/* Contact Email */}
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-700 mb-1">Contact Email *</label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="e.g., owner@store.com"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition"
                />
              </div>
            </div>

            {/* Right column: PH location cascading selects */}
            <div className="space-y-4">
              {/* Province */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Province *</label>
                <select
                  value={provinceCode}
                  onChange={(e) => {
                    setProvinceCode(e.target.value);
                    setCityCode('');
                    setBarangayCode('');
                  }}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition"
                >
                  <option value="">Select Province</option>
                  {provinces.map(p => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* City / Municipality */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City / Municipality *</label>
                <select
                  value={cityCode}
                  onChange={(e) => {
                    setCityCode(e.target.value);
                    setBarangayCode('');
                  }}
                  disabled={!provinceCode || loading}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition"
                >
                  <option value="">Select City / Municipality</option>
                  {cities.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Barangay */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Barangay *</label>
                <select
                  value={barangayCode}
                  onChange={(e) => setBarangayCode(e.target.value)}
                  disabled={!cityCode || loading}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition"
                >
                  <option value="">Select Barangay</option>
                  {barangays.map(b => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="House / Building / Street"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition"
                />
              </div>
            </div>
          </div>

          {/* Business Type */}
          <div>
            <label htmlFor="businessType" className="block text-sm font-medium text-slate-700 mb-1">
              Business Type *
            </label>
            <select
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition"
            >
              <option value="RESTAURANT">Restaurant</option>
              <option value="SALON">Salon</option>
              <option value="SARI_SARI">Sari-Sari</option>
              <option value="LAUNDRY">Laundry</option>
              <option value="PHARMACY">Pharmacy</option>
            </select>
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

          {/* Owner Password */}
          <div>
            <label htmlFor="ownerPassword" className="block text-sm font-medium text-slate-700 mb-1">
              Owner Password *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="ownerPassword"
                name="ownerPassword"
                value={formData.ownerPassword}
                onChange={handleChange}
                placeholder="Set or generate a password"
                disabled={loading}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition"
              />
              <button
                type="button"
                onClick={() => {
                  const random = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2);
                  setFormData(prev => ({ ...prev, ownerPassword: random }));
                }}
                className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
                disabled={loading}
              >
                Generate
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">Share this with the owner for future access. Store logins are currently disabled.</p>
          </div>

          {/* Plan + Modules selection */}
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-700">Modules for customer</div>
              <div className="flex items-center gap-2">
                <button type="button" className={`px-2 py-1 rounded ${plan==='Free'?'bg-slate-800 text-white':'bg-slate-100'}`} onClick={() => { setPlan('Free'); const base:any = { ...FREE_PLAN }; (BUSINESS_MODULE_PRESETS[formData.businessType]||[]).forEach((m:string)=> base[m]=true); setModules(base); }}>Seed Free</button>
                <button type="button" className={`px-2 py-1 rounded ${plan==='Premium'?'bg-amber-500 text-white':'bg-amber-100'}`} onClick={() => { setPlan('Premium'); const base:any = { ...PREMIUM_PLAN }; (BUSINESS_MODULE_PRESETS[formData.businessType]||[]).forEach((m:string)=> base[m]=true); setModules(base); }}>Seed Premium</button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {Object.keys({ ...FREE_PLAN, ...PREMIUM_PLAN }).map((key) => (
                <label key={key} className="flex items-center gap-2">
                  <input type="checkbox" checked={!!modules[key]} onChange={(e)=> setModules(prev => ({ ...prev, [key]: e.target.checked }))} />
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
              {loading ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
