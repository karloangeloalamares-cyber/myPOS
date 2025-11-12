import { Store, StoreSettings, BusinessType, FeatureFlags } from '../types';
import { BUSINESS_PRESETS } from '../src/config/businessPresets';

// Store Management Service
// Handles multi-store operations and store-specific configurations

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
    const stored = localStorage.getItem('stores');
    const list: Store[] = stored ? JSON.parse(stored) : [];
    // Backward-compat: ensure new fields exist
    return list.map(s => {
      const bizType = (s.businessType || 'RESTAURANT') as BusinessType;
      // Normalize features strictly to business type to avoid mismatches
      return {
        ...s,
        businessType: bizType,
        features: BUSINESS_PRESETS[bizType],
      } as Store;
    });
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
