const DEMO_CLEAN_FLAG = 'DEMO_DATA_CLEARED_V1';

// Explicit keys created by prior demo seeding or legacy flows
const KEYS_TO_REMOVE = [
  'stores',
  'TEST_SEED_DONE',
  'DEMO_SEEDED_V2',
  'test_users_v1',
  'store_owners_v1',
  'cart',
  'products',
  'transactions',
  'expenses',
  'settings',
  'discount',
  'staff',
  'appointments',
  'tickets',
];

// Per-store keys follow predictable prefixes; clear them to avoid leftover catalog data
const PREFIXES_TO_REMOVE = [
  'products_',
  'categories_',
  'transactions_',
  'expenses_',
  'staff_',
  'appointments_',
  'tickets_',
];

export function resetDemoDataIfNeeded() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    const storage = window.localStorage;
    if (storage.getItem(DEMO_CLEAN_FLAG) === '1') {
      return;
    }

    KEYS_TO_REMOVE.forEach((key) => storage.removeItem(key));

    for (let i = storage.length - 1; i >= 0; i -= 1) {
      const key = storage.key(i);
      if (!key) continue;
      if (PREFIXES_TO_REMOVE.some((prefix) => key.startsWith(prefix))) {
        storage.removeItem(key);
      }
    }

    storage.setItem(DEMO_CLEAN_FLAG, '1');
  } catch (error) {
    console.warn('Demo data cleanup skipped:', error);
  }
}
