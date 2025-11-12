# Multi-Store POS System - Architecture Documentation

## Overview

This POS system has been redesigned to support **multi-store operations** with **Super Admin** management capabilities, while maintaining backward compatibility with existing single-store implementations.

## Database Schema Architecture

### 1. Authentication & Authorization

#### User Roles
- **super_admin**: Manages all stores, users, and generates company-wide reports
- **store_manager**: Manages a specific store, approves expenses, views reports for their store
- **cashier**: Processes transactions, limited to POS operations
- **inventory_manager**: Manages inventory, stock adjustments, and transfers

```typescript
User {
  id: string              // Unique identifier
  email: string           // Login credential
  name: string
  role: UserRole          // Determines permissions
  storeId: string | null  // null for super_admin
  enabled: boolean
  createdAt: Date
  lastLogin?: Date
}
```

### 2. Store Management

Each organization can manage multiple stores with unique configurations:

```typescript
Store {
  id: string              // Unique store identifier
  name: string
  code: string            // e.g., "STORE001" for easy reference
  settings: StoreSettings // Tax rate, hours, currency, etc.
  enabled: boolean        // Can be disabled without deletion
  managerId?: string      // Reference to store_manager User
  createdAt: Date
  updatedAt: Date
}

StoreSettings {
  storeName: string
  taxRate: number         // e.g., 12 for 12%
  lowStockThreshold: number
  currency: string        // e.g., "PHP"
  operatingHours?: { open, close }
  timezone: string
}
```

### 3. Products & Inventory

Products are now scoped to stores and include SKUs for better tracking:

```typescript
ProductCategory {
  id: string
  storeId: string         // Store-specific categories
  name: string
  order: number           // For sorting
  enabled: boolean
}

Product {
  id: string
  storeId: string         // Each store has independent product lists
  sku: string             // Stock Keeping Unit for tracking
  categoryId: string      // Reference to category
  name: string
  price: number           // Selling price
  cost: number            // Cost to business
  stock: number
  imageUrl: string
  barcode?: string        // Optional barcode/QR code
  enabled: boolean
  allergens?: string[]    // For restaurants
  metadata?: object       // Future extensibility
  createdAt: Date
  updatedAt: Date
}
```

### 4. Transactions & Payments

Transactions are tied to specific stores and cashiers for audit trails:

```typescript
Transaction {
  id: string
  storeId: string                 // Which store processed the sale
  cashierId: string               // Which user (audit trail)
  items: CartItem[]
  subtotal: number
  discountDetails: DiscountRule | null
  discountAmount: number
  tax: number
  total: number
  paymentMethod: 'cash' | 'card' | 'mobile' | 'check'
  paymentDetails?: {              // Store payment-specific info
    cardLast4?: string
    mobileProvider?: string
    referenceNumber?: string
  }
  status: TransactionStatus       // For refunds/cancellations
  notes?: string
  timestamp: Date
  refundedAt?: Date
  refundReason?: string
}

DiscountRule {
  id: string
  storeId: string
  name: string
  type: 'percent' | 'fixed' | 'bogo'
  value: number
  minAmount?: number              // Minimum purchase threshold
  maxDiscount?: number
  applicableCategories?: string[] // Limit to specific categories
  startDate?: Date                // Promotional date range
  endDate?: Date
  enabled: boolean
}
```

### 5. Expenses & Approvals

Expenses now support approval workflows:

```typescript
Expense {
  id: string
  storeId: string
  recordedBy: string              // Which user created it
  description: string
  amount: number
  category: ExpenseCategory
  receipt?: string                // URL to receipt image
  date: Date
  approvedBy?: string             // Which manager approved
  approved: boolean               // Workflow status
  createdAt: Date
}
```

### 6. Inventory Management

New inventory adjustment and transfer tracking:

```typescript
StockAdjustment {
  id: string
  storeId: string
  productId: string
  reason: 'damage' | 'theft' | 'recount' | 'expiry' | 'returned' | 'other'
  quantityAdjustment: number      // Positive or negative
  notes?: string
  recordedBy: string              // Audit trail
  timestamp: Date
}

InventoryTransfer {
  id: string
  fromStoreId: string             // Source store
  toStoreId: string               // Destination store
  items: { productId, quantity }[]
  status: 'pending' | 'in-transit' | 'received' | 'cancelled'
  initiatedBy: string
  approvedBy?: string
  receivedBy?: string
  createdAt: Date
  completedAt?: Date
}
```

### 7. Analytics & Reporting

Multi-level reporting for store managers and super admins:

```typescript
DailySalesReport {
  storeId: string
  date: Date
  totalTransactions: number
  totalRevenue: number
  totalCost: number
  grossProfit: number
  totalExpenses: number
  netProfit: number
  topProducts: { productId, name, quantitySold, revenue }[]
}

StorePerformance {
  storeId: string
  storeName: string
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  startDate: Date
  endDate: Date
  revenue: number
  cost: number
  profit: number
  grossMargin: number             // (profit / revenue) * 100
  transactionCount: number
  averageTransaction: number
  topCategories: { categoryId, name, revenue, profitMargin }[]
}

AdminDashboard {
  totalStores: number
  activeStores: number
  totalRevenue: number            // All stores combined
  totalExpenses: number
  totalProfit: number
  topPerformingStore: StorePerformance
  revenueByStore: { storeId, storeName, revenue }[]
  userCount: number
  pendingApprovals: { expenses, transfers }
}
```

### 8. Audit Logging

All important actions are logged for compliance:

```typescript
AuditLog {
  id: string
  userId: string                  // Who did it
  storeId?: string                // Which store (if applicable)
  action: string                  // 'created_transaction', 'approved_expense', etc.
  entity: string                  // 'transaction', 'product', 'user'
  entityId: string                // ID of affected entity
  changes?: {
    before?: object               // Previous state
    after?: object                // New state
  }
  ipAddress?: string
  timestamp: Date
}
```

## Service Layer

Each major domain has a dedicated service for API integration:

- **authService.ts** - User authentication and token management
- **storeService.ts** - Store CRUD and configuration
- **productService.ts** - Products, categories, and SKU management
- **reportingService.ts** - Transactions, expenses, and analytics

All services include TODO comments for backend API integration.

## Data Isolation

- **Store-level data**: All products, transactions, and expenses are filtered by `storeId`
- **User permissions**: Access is validated based on `User.role` and `User.storeId`
- **Super Admin**: Can access data from all stores (null storeId)

## Migration Path from Single Store

Existing single-store data can be migrated by:

1. Creating a `Store` record with appropriate settings
2. Assigning all products a `storeId` and `categoryId`
3. Assigning all transactions a `storeId` and `cashierId`
4. Creating a `store_manager` user and assigning to the store

## Future Enhancements

- [ ] Supplier management for multi-vendor operations
- [ ] Commission tracking for employees
- [ ] Loyalty program support
- [ ] Franchise/district management for large chains
- [ ] Real-time inventory sync across stores
- [ ] Advanced promotional rules and campaigns
- [ ] Payment gateway integrations (Stripe, PayMongo, etc.)
- [ ] Mobile app for cashiers and managers
- [ ] Cloud backup and disaster recovery
- [ ] Analytics dashboard with charts and trends

## Backend API Endpoints (To Be Implemented)

### Authentication
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/verify
```

### Stores
```
GET    /api/stores
POST   /api/stores
GET    /api/stores/:id
PUT    /api/stores/:id
DELETE /api/stores/:id
PUT    /api/stores/:id/settings
```

### Products
```
GET    /api/stores/:storeId/products
POST   /api/stores/:storeId/products
GET    /api/stores/:storeId/products/:id
PUT    /api/stores/:storeId/products/:id
DELETE /api/stores/:storeId/products/:id
GET    /api/stores/:storeId/products/search?q=...
GET    /api/stores/:storeId/products/sku/:sku

GET    /api/stores/:storeId/categories
POST   /api/stores/:storeId/categories
PUT    /api/stores/:storeId/categories/:id
DELETE /api/stores/:storeId/categories/:id
```

### Transactions
```
GET    /api/stores/:storeId/transactions
POST   /api/stores/:storeId/transactions
POST   /api/stores/:storeId/transactions/:id/refund
```

### Expenses
```
GET    /api/stores/:storeId/expenses
POST   /api/stores/:storeId/expenses
PUT    /api/stores/:storeId/expenses/:id/approve
```

### Reports
```
GET    /api/stores/:storeId/reports/daily?date=...
GET    /api/stores/:storeId/reports/performance?period=...&startDate=...&endDate=...
GET    /api/reports/multi-store-performance?period=...&startDate=...&endDate=...
GET    /api/admin/dashboard
```

### Audit Logs
```
GET    /api/audit-logs?userId=...&storeId=...&action=...&startDate=...&endDate=...
```

---

**Last Updated:** November 11, 2025
**Schema Version:** 2.0 (Multi-Store, Enterprise Ready)
