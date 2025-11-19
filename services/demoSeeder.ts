import { productService } from './productService';
import { staffService } from './staffService';
import { readLocalTips, writeLocalTips, TipRecord } from '@/lib/tips';
import { CartItem, Expense, PaymentMethod, Product, Staff, Store, Transaction } from '../types';

const DEMO_STORE_CODE = 'DEMO_STORE';
const DEMO_SEED_KEY_PREFIX = 'demo_seed_v2';

interface SeedSnapshot {
  products: Product[];
  transactions: Transaction[];
  expenses: Expense[];
  staff: Staff[];
}

interface CategoryTemplate {
  key: string;
  name: string;
  description: string;
  order: number;
}

interface ProductTemplate {
  sku: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  imageUrl: string;
  categoryKey: string;
  isCommissionable?: boolean;
  commissionRate?: number;
  itemType?: 'product' | 'service';
  durationMinutes?: number;
}

interface TransactionTemplate {
  idSuffix: string;
  lines: { sku: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  staffIndex?: number;
  note?: string;
  daysAgo: number;
  referenceNumber?: string;
}

const CATEGORY_TEMPLATES: CategoryTemplate[] = [
  {
    key: 'coffee',
    name: 'Coffee & Drinks',
    description: 'House-crafted drinks',
    order: 1,
  },
  {
    key: 'pastries',
    name: 'Breads & Pastries',
    description: 'Freshly baked daily',
    order: 2,
  },
  {
    key: 'services',
    name: 'Salon Services',
    description: 'Add-on treatments',
    order: 3,
  },
];

const PRODUCT_TEMPLATES: ProductTemplate[] = [
  {
    sku: 'COF-001',
    name: 'Iced Spanish Latte',
    description: 'Creamy espresso with muscovado syrup.',
    price: 185,
    cost: 65,
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=600&q=60',
    categoryKey: 'coffee',
    isCommissionable: true,
    commissionRate: 0.1,
    itemType: 'product',
  },
  {
    sku: 'COF-002',
    name: 'Salted Caramel Cold Brew',
    description: 'Slow-steeped brew finished with caramel cream.',
    price: 210,
    cost: 75,
    stock: 32,
    imageUrl: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=600&q=60',
    categoryKey: 'coffee',
    isCommissionable: true,
    commissionRate: 0.08,
    itemType: 'product',
  },
  {
    sku: 'PASTRY-001',
    name: 'Almond Croissant',
    description: 'Flaky croissant stuffed with almond cream.',
    price: 145,
    cost: 55,
    stock: 24,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=60',
    categoryKey: 'pastries',
    itemType: 'product',
  },
  {
    sku: 'SRV-001',
    name: 'Gel Manicure Upgrade',
    description: '45-minute gel manicure with custom finish.',
    price: 650,
    cost: 150,
    stock: 0,
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=60',
    categoryKey: 'services',
    isCommissionable: true,
    commissionRate: 0.3,
    itemType: 'service',
    durationMinutes: 60,
  },
  {
    sku: 'SRV-002',
    name: 'Aromatherapy Scalp Massage',
    description: '25-minute scalp massage add-on.',
    price: 420,
    cost: 120,
    stock: 0,
    imageUrl: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=600&q=60',
    categoryKey: 'services',
    isCommissionable: true,
    commissionRate: 0.2,
    itemType: 'service',
    durationMinutes: 30,
  },
];

const TRANSACTION_TEMPLATES: TransactionTemplate[] = [
  {
    idSuffix: '1001',
    lines: [
      { sku: 'COF-001', quantity: 2 },
      { sku: 'PASTRY-001', quantity: 1 },
    ],
    paymentMethod: 'cash',
    staffIndex: 0,
    note: 'Morning combo order',
    daysAgo: 2,
  },
  {
    idSuffix: '1002',
    lines: [
      { sku: 'SRV-001', quantity: 1 },
      { sku: 'COF-002', quantity: 1 },
    ],
    paymentMethod: 'card',
    staffIndex: 1,
    note: 'Gel manicure with drink',
    daysAgo: 1,
    referenceNumber: '8064',
  },
  {
    idSuffix: '1003',
    lines: [
      { sku: 'SRV-002', quantity: 1 },
      { sku: 'COF-001', quantity: 1 },
    ],
    paymentMethod: 'mobile',
    staffIndex: 2,
    note: 'Loyal client visit',
    daysAgo: 0,
  },
];

export async function ensureDemoData(store: Store | null): Promise<SeedSnapshot | null> {
  if (!store || typeof window === 'undefined') {
    return null;
  }

  if (store.code !== DEMO_STORE_CODE) {
    return null;
  }

  const seedKey = `${DEMO_SEED_KEY_PREFIX}_${store.id}`;
  const hasSeedFlag = Boolean(window.localStorage.getItem(seedKey));
  const existingProducts = await productService.getProducts(store.id);
  const needsSeed = !hasSeedFlag || existingProducts.length === 0;

  if (!needsSeed) {
    return null;
  }

  await seedDemoStore(store);
  window.localStorage.setItem(seedKey, new Date().toISOString());

  return {
    products: await productService.getProducts(store.id),
    transactions: readGlobalArray<Transaction>('transactions'),
    expenses: readGlobalArray<Expense>('expenses'),
    staff: staffService.getAll(),
  };
}

async function seedDemoStore(store: Store) {
  const categoryMap = await ensureCategories(store.id);
  const productLookup = await ensureProducts(store, categoryMap);
  const staffForStore = ensureStaffSeed(store);
  const createdTransactions = seedTransactionsAndExpenses(store, productLookup, staffForStore);
  await seedTips(store, staffForStore, createdTransactions);
}

async function ensureCategories(storeId: string) {
  const existing = await productService.getCategories(storeId);
  const map = new Map<string, string>();

  existing.forEach(cat => map.set(cat.name, cat.id));

  for (const template of CATEGORY_TEMPLATES) {
    if (map.has(template.name)) continue;
    const created = await productService.createCategory(storeId, {
      storeId,
      name: template.name,
      description: template.description,
      order: template.order,
      enabled: true,
    });
    map.set(template.name, created.id);
  }

  return map;
}

async function ensureProducts(store: Store, categories: Map<string, string>) {
  const existing = await productService.getProducts(store.id);
  const lookup = new Map<string, Product>();
  existing.forEach(product => lookup.set(product.sku, product));

  for (const template of PRODUCT_TEMPLATES) {
    if (lookup.has(template.sku)) continue;
    const categoryId = categories.get(
      CATEGORY_TEMPLATES.find(cat => cat.key === template.categoryKey)?.name || ''
    );
    if (!categoryId) continue;
    const created = await productService.createProduct(store.id, {
      storeId: store.id,
      name: template.name,
      sku: template.sku,
      price: template.price,
      cost: template.cost,
      stock: template.stock,
      imageUrl: template.imageUrl,
      description: template.description,
      categoryId,
      enabled: true,
      barcode: undefined,
      allergens: undefined,
      metadata: undefined,
      isCommissionable: template.isCommissionable,
      commissionRate: template.commissionRate,
      itemType: template.itemType ?? 'product',
      taxable: true,
      durationMinutes: template.durationMinutes,
    });
    lookup.set(template.sku, created);
  }

  return lookup;
}

function ensureStaffSeed(store: Store) {
  const existing = staffService.getAll();
  const storeStaff = existing.filter(member => member.storeIds.includes(store.id));
  if (storeStaff.length >= 2) {
    return storeStaff;
  }

  const sampleStaff = [
    {
      name: 'Ava Santos',
      role: 'THERAPIST' as Staff['role'],
      contactPhone: '09171234560',
    },
    {
      name: 'Noah Dizon',
      role: 'CASHIER' as Staff['role'],
      contactPhone: '09175551234',
    },
    {
      name: 'Mika Reyes',
      role: 'WAITER' as Staff['role'],
      contactPhone: '09181110321',
    },
  ];

  const created: Staff[] = [];

  sampleStaff.forEach(staff => {
    const match = storeStaff.find(member => member.name === staff.name);
    if (match) {
      created.push(match);
      return;
    }
    const record = staffService.create({
      name: staff.name,
      role: staff.role,
      storeIds: [store.id],
      contactPhone: staff.contactPhone,
      modules: ['pos'],
      isActive: true,
    });
    created.push(record);
  });

  return [...storeStaff, ...created];
}

function seedTransactionsAndExpenses(store: Store, products: Map<string, Product>, staff: Staff[]) {
  const existingTransactions = readGlobalArray<Transaction>('transactions');
  const existingExpenses = readGlobalArray<Expense>('expenses');

  const newTransactions: Transaction[] = [];
  const commissionExpenses: Expense[] = [];

  TRANSACTION_TEMPLATES.forEach((template, index) => {
    const items: CartItem[] = template.lines
      .map(line => {
        const product = products.get(line.sku);
        if (!product) return null;
        return { ...product, quantity: line.quantity };
      })
      .filter(Boolean) as CartItem[];

    if (items.length === 0) return;

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxRate = (store.settings?.taxRate ?? 0) / 100;
    const tax = Number((subtotal * taxRate).toFixed(2));
    const commissionTotal = items.reduce((sum, item) => {
      if (!item.isCommissionable || !item.commissionRate) return sum;
      return sum + item.price * item.quantity * item.commissionRate;
    }, 0);
    const staffMember = template.staffIndex !== undefined ? staff[template.staffIndex] : undefined;
    const timestamp = new Date(Date.now() - template.daysAgo * 24 * 60 * 60 * 1000);

    const transaction: Transaction = {
      id: `TX-DEMO-${template.idSuffix}`,
      storeId: store.id,
      cashierId: staffMember?.id || 'demo_cashier',
      items,
      subtotal,
      discountDetails: null,
      discountAmount: 0,
      tax,
      total: Number((subtotal + tax).toFixed(2)),
      paymentMethod: template.paymentMethod,
      paymentDetails: template.referenceNumber
        ? { referenceNumber: template.referenceNumber }
        : undefined,
      status: 'completed',
      notes: template.note,
      timestamp,
      commissionTotal: Number(commissionTotal.toFixed(2)),
      staffId: staffMember?.id || null,
      staffName: staffMember?.name || null,
    };

    newTransactions.push(transaction);

    if (transaction.commissionTotal && transaction.commissionTotal > 0) {
      commissionExpenses.push({
        id: `ex-comm-${transaction.id}`,
        storeId: store.id,
        recordedBy: 'demo_seed',
        description: `Commissions for ${transaction.id}`,
        amount: transaction.commissionTotal,
        category: 'COMMISSIONS',
        date: timestamp,
        approvedBy: 'demo_seed',
        approved: true,
        createdAt: timestamp,
      });
    }
  });

  if (newTransactions.length > 0) {
    writeGlobalArray('transactions', [...existingTransactions, ...newTransactions]);
  }

  if (commissionExpenses.length > 0) {
    writeGlobalArray('expenses', [...existingExpenses, ...commissionExpenses]);
  }

  return newTransactions;
}

function seedTips(store: Store, staff: Staff[], createdTransactions: Transaction[]) {
  if (!createdTransactions.length) return;

  const shareTargets = staff.slice(0, 2);
  const tipTransactions = createdTransactions.slice(0, 2);
  const existing = readLocalTips(store.id);

  const seededTips: TipRecord[] = tipTransactions.map((transaction, index) => {
    const createdAt = new Date(transaction.timestamp.getTime() + (index + 1) * 1000).toISOString();
    const totalTip = index === 0 ? 150 : 90;
    const shares = shareTargets.map((member, shareIndex) => ({
      staff_id: member?.id || `demo_staff_${shareIndex}`,
      amount: index === 0 ? (shareIndex === 0 ? 90 : 60) : 45,
      staff: member ? { id: member.id, name: member.name } : undefined,
    }));

    return {
      id: `demo_tip_${transaction.id}_${index}`,
      store_id: store.id,
      sale_id: transaction.id,
      total_tip: totalTip,
      method: (index === 0 ? 'cash' : 'card') as 'cash' | 'card',
      status: index === 0 ? 'settled' : 'unsettled',
      settled_at: index === 0 ? createdAt : null,
      created_at: createdAt,
      shares,
    };
  });

  writeLocalTips(store.id, [...seededTips, ...existing]);
}

function readGlobalArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw, (prop, value) => {
      if (
        prop === 'timestamp' ||
        prop === 'date' ||
        prop === 'createdAt' ||
        prop === 'updatedAt'
      ) {
        return new Date(value);
      }
      return value;
    }) as T[];
  } catch {
    return [];
  }
}

function writeGlobalArray<T>(key: string, value: T[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}
