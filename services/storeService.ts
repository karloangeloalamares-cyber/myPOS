import { Store, StoreSettings, BusinessType, FeatureFlags } from '../types';
import { BUSINESS_PRESETS } from '../src/config/businessPresets';
import { supabase } from '@/lib/supabase';
import { createOwnerForStore, getOwnerForStore, DEFAULT_STORE_OWNER_PASSWORD } from './localAuth';

// Store Management Service
// Handles multi-store operations and store-specific configurations

const DEFAULT_OWNER_EMAIL = 'owner@mypos.local';
const DEFAULT_OWNER_PHONE = '09171234567';
const DEFAULT_OWNER_NAME = 'Store Owner';

function ensureOwnerProvisioned(store?: Store) {
  if (!store?.id) return;
  try {
    const existing = getOwnerForStore(store.id);
    if (existing) return;
    const email = store.contactEmail || store.email || DEFAULT_OWNER_EMAIL;
    const phone = store.contactPhone || store.phone || DEFAULT_OWNER_PHONE;
    const name = store.ownerName || store.name || DEFAULT_OWNER_NAME;
    createOwnerForStore(store, {
      name,
      email,
      phone,
      password: DEFAULT_STORE_OWNER_PASSWORD,
    });
  } catch (err) {
    console.warn('Failed to provision owner for store', store?.id, err);
  }
}

interface StoreServiceInterface {
  getAllStores(): Promise<Store[]>;
  getStore(storeId: string): Promise<Store | null>;
  // Accepts an optional businessType; features are auto-attached from presets
  createStore(store: Omit<Store, 'id' | 'createdAt' | 'updatedAt'> & { businessType?: BusinessType; features?: FeatureFlags }): Promise<Store>;
  updateStore(storeId: string, updates: Partial<Store>): Promise<Store>;
  deleteStore(storeId: string): Promise<void>;
  updateStoreSettings(storeId: string, settings: Partial<StoreSettings>): Promise<Store>;
  getStoresByManager(managerId: string): Promise<Store[]>;
}

export const storeService: StoreServiceInterface = {
  async getAllStores() {
    // TODO: Implement API call
    // GET /api/stores
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      // Restrict columns to those that exist in the Supabase schema to avoid 400 errors.
      const { data, error } = await supabase
        .from('stores')
        .select('id, code, name, owner_name, contact_phone, contact_email, created_at, updated_at')
        .order('created_at', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const remoteStores = (data as any[]).map(row => {
          const base: Store = {
            id: row.id,
            code: row.code,
            name: row.name,
            ownerName: row.owner_name ?? undefined,
            contactPhone: row.contact_phone ?? undefined,
            contactEmail: row.contact_email ?? undefined,
            phone: row.contact_phone ?? '',
            email: row.contact_email ?? '',
            addressStructured: undefined,
            addressDeprecated: undefined as never,
            settings: {
              storeName: row.name,
              storeAddress: '',
              contactInfo: row.contact_phone ?? '',
              phone: row.contact_phone ?? '',
              email: row.contact_email ?? '',
              taxRate: 12,
              lowStockThreshold: 10,
              currency: 'PHP',
              timezone: 'Asia/Manila',
            },
            businessType: 'RESTAURANT',
            features: BUSINESS_PRESETS['RESTAURANT'],
            enabled: true,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
          };
          return base;
        });
        remoteStores.forEach(ensureOwnerProvisioned);
        return remoteStores;
      }
    }
    const stored = localStorage.getItem('stores');
    const list: Store[] = stored ? JSON.parse(stored) : [];
    if (list.length === 0) {
      const demoStore: Store = {
        id: '2406df5a-d98a-4acd-9415-800b814a7aa8',
        code: 'DEMO_STORE',
        name: 'myPOS Demo Store',
        ownerName: 'myPOS Demo',
        contactPhone: '09171234567',
        contactEmail: 'owner@mypos.local',
        phone: '09171234567',
        email: 'owner@mypos.local',
        addressStructured: undefined,
        addressDeprecated: undefined as never,
        settings: {
          storeName: 'myPOS Demo Store',
          storeAddress: 'Demo Ave',
          contactInfo: '09171234567',
          phone: '09171234567',
          email: 'owner@mypos.local',
          taxRate: 12,
          lowStockThreshold: 10,
          currency: 'PHP',
          timezone: 'Asia/Manila',
        },
        businessType: 'RESTAURANT',
        features: BUSINESS_PRESETS['RESTAURANT'],
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updated = [demoStore];
      localStorage.setItem('stores', JSON.stringify(updated));
      updated.forEach(ensureOwnerProvisioned);
      return updated;
    }
    // Backward-compat: ensure new fields exist
    const normalized = list.map(s => {
      const bizType = (s.businessType || 'RESTAURANT') as BusinessType;
      return {
        ...s,
        businessType: bizType,
        features: BUSINESS_PRESETS[bizType],
      } as Store;
    });
    normalized.forEach(ensureOwnerProvisioned);
    return normalized;
  },

  async getStore(storeId: string) {
    // TODO: Implement API call
    // GET /api/stores/:id
    const stores = await this.getAllStores();
    return stores.find((s: Store) => s.id === storeId) || null;
  },

  async createStore(store: Omit<Store, 'id' | 'createdAt' | 'updatedAt'> & { businessType?: BusinessType; features?: FeatureFlags }) {
    // TODO: Implement API call
    // POST /api/stores
    const bizType: BusinessType = store.businessType || 'RESTAURANT';
    const features: FeatureFlags = store.features || BUSINESS_PRESETS[bizType] || {};
    const newStore: Store = {
      ...store,
      businessType: bizType,
      features,
      id: `store_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const stores = await this.getAllStores();
    const updated = [...stores, newStore];
    localStorage.setItem('stores', JSON.stringify(updated));
    // No test user seeding
    return newStore;
  },

  async updateStore(storeId: string, updates: Partial<Store>) {
    // TODO: Implement API call
    // PUT /api/stores/:id
    const stores = await this.getAllStores();
    const index = stores.findIndex((s: Store) => s.id === storeId);
    if (index === -1) throw new Error('Store not found');
    // If businessType changes and features not explicitly provided, attach presets for the new type
    let nextUpdates = { ...updates } as Partial<Store>;
    if (updates && 'businessType' in updates && !updates.features) {
      const nextType = (updates.businessType || stores[index].businessType) as BusinessType;
      if (nextType) {
        nextUpdates.features = BUSINESS_PRESETS[nextType];
      }
    }
    stores[index] = { ...stores[index], ...nextUpdates, updatedAt: new Date() };
    localStorage.setItem('stores', JSON.stringify(stores));
    return stores[index];
  },

  async deleteStore(storeId: string) {
    // TODO: Implement API call
    // DELETE /api/stores/:id
    const stores = await this.getAllStores();
    const filtered = stores.filter((s: Store) => s.id !== storeId);
    localStorage.setItem('stores', JSON.stringify(filtered));
  },

  async updateStoreSettings(storeId: string, settings: Partial<StoreSettings>) {
    // TODO: Implement API call
    // PUT /api/stores/:id/settings
    const store = await this.getStore(storeId);
    if (!store) throw new Error('Store not found');
    const updated = { ...store, settings: { ...store.settings, ...settings } };
    return this.updateStore(storeId, updated);
  },

  async getStoresByManager(managerId: string) {
    // TODO: Implement API call
    // GET /api/stores?managerId=...
    const stores = await this.getAllStores();
    return stores.filter((s: Store) => s.managerId === managerId);
  },

};
