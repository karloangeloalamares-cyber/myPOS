
// ==================== AUTHENTICATION & ROLES ====================

export type UserRole = 'super_admin' | 'store_manager' | 'cashier' | 'inventory_manager';
export type Theme = 'light' | 'dark';

// ==================== BUSINESS TYPES & FEATURES ====================

// Supported micro-business verticals
export type BusinessType =
  | 'SALON'
  | 'SARI_SARI'
  | 'RESTAURANT'
  | 'LAUNDRY'
  | 'PHARMACY'
  | 'RETAIL';

// Feature flags per business vertical (all optional to keep backward-compat)
export interface FeatureFlags {
  enableAppointments?: boolean;   // Salon
  enableUtangLedger?: boolean;    // Sari-sari (customer credit)
  enableTables?: boolean;         // Restaurant table management
  enableTickets?: boolean;        // Laundry/Salon ticketing or queue
  enableExpiryAlerts?: boolean;   // Pharmacy expiries
}

// Optional higher-level business config descriptor
export interface BusinessConfig {
  id: string;
  name: string;
  type: BusinessType;
  features: FeatureFlags;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // Should be hashed in production
  role: UserRole;
  storeId: string | null; // null for super_admin who manages all stores
  enabled: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ==================== STORE MANAGEMENT ====================

export interface StoreSettings {
  storeName: string;
  storeAddress: string;
  contactInfo: string;
  phone: string;
  email: string;
  taxRate: number; // e.g., 12 for 12%
  lowStockThreshold: number;
  currency: string; // e.g., 'PHP'
  operatingHours?: {
    open: string; // "09:00"
    close: string; // "22:00"
  };
  timezone: string;
}

// ==================== STAFF ====================

export type StaffRole = 'STAFF' | 'CASHIER' | 'THERAPIST' | 'BARBER' | 'WAITER' | 'OTHER';

export interface Staff {
  id: string;
  name: string;
  nickname?: string;
  role: StaffRole;
  storeIds: string[];
  contactPhone?: string;
  isActive: boolean;
  createdAt: Date;
}

// Structured, location-aware store address for PH
export interface StoreAddress {
  street: string;    // free text
  barangay: string;  // name
  city: string;      // name
  province: string;  // name
}

export interface Store {
  id: string;
  name: string;
  code: string; // e.g., "STORE001"
  // New structured contact and address fields
  ownerName?: string;        // migration-safe optional
  contactPhone?: string;     // migration-safe optional
  contactEmail?: string;     // migration-safe optional
  addressStructured?: StoreAddress;    // migration-safe optional structured address
  // Back-compat until full migration is complete
  addressDeprecated?: never; // reserved to discourage use
  /** @deprecated Use addressStructured (and settings.storeAddress for city/province line) */
  address?: string;
  /** @deprecated Use contactPhone */
  phone: string;
  /** @deprecated Use contactEmail */
  email: string;
  settings: StoreSettings;
  // New: business vertical and feature flags
  businessType?: BusinessType; // optional for backward compatibility
  features?: FeatureFlags;     // optional for backward compatibility
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  managerId?: string; // Reference to User with store_manager role
}

// ==================== PRODUCTS & CATEGORIES ====================

export interface ProductCategory {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  order: number; // For sorting
  enabled: boolean;
  createdAt: Date;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  sku: string; // Stock Keeping Unit for tracking
  price: number;
  cost: number;
  stock: number;
  imageUrl: string;
  description: string;
  categoryId: string;
  enabled: boolean;
  barcode?: string;
  allergens?: string[];
  metadata?: Record<string, any>; // For future extensibility
  // Optional per-item commission configuration (multi-vertical)
  isCommissionable?: boolean;
  commissionRate?: number | null; // decimal form, e.g., 0.35 for 35%
  // Unified item support
  itemType?: 'product' | 'service' | 'menu' | 'ingredient' | 'consumable';
  taxable?: boolean;
  // Service
  durationMinutes?: number;
  assignedRoles?: string[];
  // Menu bundles
  bundleItems?: { itemId: string; qty: number }[];
  printName?: string;
  // Items consumed when this item is sold (for product/service/menu)
  consumedItems?: { itemId: string; qty: number }[];
  // Ingredient
  uom?: string; // e.g., g/ml/pcs
  defaultCost?: number;
  isSellable?: boolean; // if false, price may be unused
  // Extras
  lowStockThreshold?: number;
  expiryDate?: string;
  supplier?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem extends Product {
  quantity: number;
  discountApplied?: number; // Per-item discount
}

// ==================== TRANSACTIONS & PAYMENTS ====================

export type PaymentMethod = 'cash' | 'card' | 'mobile' | 'check';
export type TransactionStatus = 'completed' | 'pending' | 'cancelled' | 'refunded';

export interface DiscountRule {
  id: string;
  storeId: string;
  name: string;
  type: 'percent' | 'fixed' | 'bogo'; // Buy One Get One
  value: number;
  minAmount?: number; // Minimum purchase required
  maxDiscount?: number; // Max discount cap for percent types
  applicableCategories?: string[]; // If empty, applies to all
  startDate?: Date;
  endDate?: Date;
  enabled: boolean;
}

export interface Discount extends DiscountRule {
  calculatedAmount: number; // The actual discount amount applied
}

export interface Transaction {
  id: string;
  storeId: string;
  cashierId: string; // Reference to User who processed it
  items: CartItem[];
  subtotal: number;
  discountDetails: Discount | null;
  discountAmount: number; // The calculated amount
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentDetails?: {
    cardLast4?: string;
    mobileProvider?: string;
    referenceNumber?: string;
  };
  status: TransactionStatus;
  notes?: string;
  timestamp: Date;
  refundedAt?: Date;
  refundReason?: string;
  commissionTotal?: number; // Commissions recorded as operating expenses
  staffId?: string | null;   // Optional staff/attendant reference
  staffName?: string | null; // Optional display-only staff name
}

// ==================== EXPENSES ====================

export type ExpenseCategory = 'Payroll' | 'Rent' | 'Utilities' | 'Marketing' | 'Supplies' | 'Maintenance' | 'Other' | 'COMMISSIONS';

export interface Expense {
  id: string;
  storeId: string;
  recordedBy: string; // Reference to User
  description: string;
  amount: number;
  category: ExpenseCategory;
  receipt?: string; // URL to receipt image
  date: Date;
  approvedBy?: string; // Reference to User (manager approval)
  approved: boolean;
  createdAt: Date;
}

// ==================== INVENTORY MANAGEMENT ====================

export type StockAdjustmentReason = 'damage' | 'theft' | 'recount' | 'expiry' | 'returned' | 'other';

export interface StockAdjustment {
  id: string;
  storeId: string;
  productId: string;
  reason: StockAdjustmentReason;
  quantityAdjustment: number; // Can be positive or negative
  notes?: string;
  recordedBy: string; // Reference to User
  timestamp: Date;
}

export interface InventoryTransfer {
  id: string;
  fromStoreId: string;
  toStoreId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  status: 'pending' | 'in-transit' | 'received' | 'cancelled';
  initiatedBy: string; // Reference to User
  approvedBy?: string; // Reference to User
  receivedBy?: string; // Reference to User
  createdAt: Date;
  completedAt?: Date;
}

// ==================== ANALYTICS & REPORTING ====================

export interface DailySalesReport {
  storeId: string;
  date: Date;
  totalTransactions: number;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  topProducts: {
    productId: string;
    name: string;
    quantitySold: number;
    revenue: number;
  }[];
}

export interface StorePerformance {
  storeId: string;
  storeName: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  revenue: number;
  cost: number;
  profit: number;
  grossMargin: number; // (profit / revenue) * 100
  transactionCount: number;
  averageTransaction: number;
  topCategories: {
    categoryId: string;
    name: string;
    revenue: number;
    profitMargin: number;
  }[];
}

// ==================== UI & LOCAL STATE ====================

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // milliseconds
}

export type View = 'pos' | 'inventory' | 'reports' | 'settings' | 'admin';

// ==================== SUPER ADMIN SPECIFIC ====================

export interface AdminDashboard {
  totalStores: number;
  activeStores: number;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  topPerformingStore: StorePerformance;
  revenueByStore: {
    storeId: string;
    storeName: string;
    revenue: number;
  }[];
  userCount: number;
  pendingApprovals: {
    expenses: number;
    transfers: number;
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  storeId?: string;
  action: string; // e.g., "created_transaction", "updated_product", "user_login"
  entity: string; // e.g., "product", "transaction", "user"
  entityId: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  ipAddress?: string;
  timestamp: Date;
}

// ==================== BACKWARD COMPATIBILITY ====================
// Legacy types for existing single-store implementation

export interface SettingsData {
  storeName: string;
  storeAddress: string;
  contactInfo: string;
  taxRate: number;
  lowStockThreshold: number;
}

// Extended Product for single-store usage (backward compatible)
export interface LegacyProduct extends Omit<Product, 'storeId' | 'categoryId' | 'sku' | 'enabled' | 'barcode' | 'allergens' | 'metadata' | 'createdAt' | 'updatedAt'> {
  category: string; // Legacy field for backward compatibility
}
