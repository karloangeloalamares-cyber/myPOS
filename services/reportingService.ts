import { Transaction, Expense, DailySalesReport, StorePerformance, PaymentMethod } from '../types';

// Reporting & Analytics Service
// Handles sales, expenses, and performance metrics for single and multiple stores

interface ReportingServiceInterface {
  // Transactions
  getTransactions(storeId: string, startDate?: Date, endDate?: Date): Promise<Transaction[]>;
  createTransaction(storeId: string, cashierId: string, transaction: Omit<Transaction, 'id' | 'storeId' | 'cashierId' | 'timestamp'>): Promise<Transaction>;
  refundTransaction(storeId: string, transactionId: string, reason: string): Promise<Transaction>;

  // Expenses
  getExpenses(storeId: string, startDate?: Date, endDate?: Date): Promise<Expense[]>;
  createExpense(storeId: string, recordedBy: string, expense: Omit<Expense, 'id' | 'storeId' | 'recordedBy' | 'createdAt'>): Promise<Expense>;
  approveExpense(storeId: string, expenseId: string, approverId: string): Promise<Expense>;

  // Reports
  getDailySalesReport(storeId: string, date: Date): Promise<DailySalesReport>;
  getStorePerformance(storeId: string, period: 'daily' | 'weekly' | 'monthly' | 'yearly', startDate: Date, endDate: Date): Promise<StorePerformance>;
  getMultiStorePerformance(period: 'daily' | 'weekly' | 'monthly' | 'yearly', startDate: Date, endDate: Date): Promise<StorePerformance[]>;
}

export const reportingService: ReportingServiceInterface = {
  // ==================== TRANSACTIONS ====================

  async getTransactions(storeId: string, startDate?: Date, endDate?: Date) {
    // TODO: Implement API call with date filtering
    // GET /api/stores/:storeId/transactions?startDate=...&endDate=...
    const key = `transactions_${storeId}`;
    const stored = localStorage.getItem(key);
    let transactions: Transaction[] = stored ? JSON.parse(stored, (key, value) => {
      if (key === 'timestamp' || key === 'date' || key === 'refundedAt') return new Date(value);
      return value;
    }) : [];

    if (startDate || endDate) {
      transactions = transactions.filter(t => {
        const txDate = new Date(t.timestamp);
        if (startDate && txDate < startDate) return false;
        if (endDate && txDate > endDate) return false;
        return true;
      });
    }

    return transactions;
  },

  async createTransaction(storeId: string, cashierId: string, transaction: Omit<Transaction, 'id' | 'storeId' | 'cashierId' | 'timestamp'>) {
    // TODO: Implement API call
    // POST /api/stores/:storeId/transactions
    const newTransaction: Transaction = {
      ...transaction,
      id: `txn_${Date.now()}`,
      storeId,
      cashierId,
      timestamp: new Date(),
    };

    const transactions = await this.getTransactions(storeId);
    const updated = [...transactions, newTransaction];
    localStorage.setItem(`transactions_${storeId}`, JSON.stringify(updated));
    return newTransaction;
  },

  async refundTransaction(storeId: string, transactionId: string, reason: string) {
    // TODO: Implement API call
    // POST /api/stores/:storeId/transactions/:id/refund
    const transactions = await this.getTransactions(storeId);
    const index = transactions.findIndex(t => t.id === transactionId);
    if (index === -1) throw new Error('Transaction not found');

    transactions[index] = {
      ...transactions[index],
      status: 'refunded',
      refundedAt: new Date(),
      refundReason: reason,
    };

    localStorage.setItem(`transactions_${storeId}`, JSON.stringify(transactions));
    return transactions[index];
  },

  // ==================== EXPENSES ====================

  async getExpenses(storeId: string, startDate?: Date, endDate?: Date) {
    // TODO: Implement API call
    // GET /api/stores/:storeId/expenses?startDate=...&endDate=...
    const key = `expenses_${storeId}`;
    const stored = localStorage.getItem(key);
    let expenses: Expense[] = stored ? JSON.parse(stored, (key, value) => {
      if (key === 'date' || key === 'createdAt') return new Date(value);
      return value;
    }) : [];

    if (startDate || endDate) {
      expenses = expenses.filter(e => {
        const eDate = new Date(e.date);
        if (startDate && eDate < startDate) return false;
        if (endDate && eDate > endDate) return false;
        return true;
      });
    }

    return expenses;
  },

  async createExpense(storeId: string, recordedBy: string, expense: Omit<Expense, 'id' | 'storeId' | 'recordedBy' | 'createdAt'>) {
    // TODO: Implement API call
    // POST /api/stores/:storeId/expenses
    const newExpense: Expense = {
      ...expense,
      id: `exp_${Date.now()}`,
      storeId,
      recordedBy,
      createdAt: new Date(),
    };

    const expenses = await this.getExpenses(storeId);
    const updated = [...expenses, newExpense];
    localStorage.setItem(`expenses_${storeId}`, JSON.stringify(updated));
    return newExpense;
  },

  async approveExpense(storeId: string, expenseId: string, approverId: string) {
    // TODO: Implement API call
    // PUT /api/stores/:storeId/expenses/:id/approve
    const expenses = await this.getExpenses(storeId);
    const index = expenses.findIndex(e => e.id === expenseId);
    if (index === -1) throw new Error('Expense not found');

    expenses[index] = {
      ...expenses[index],
      approved: true,
      approvedBy: approverId,
    };

    localStorage.setItem(`expenses_${storeId}`, JSON.stringify(expenses));
    return expenses[index];
  },

  // ==================== REPORTS ====================

  async getDailySalesReport(storeId: string, date: Date): Promise<DailySalesReport> {
    // TODO: Implement API call or calculate from transactions/expenses
    // GET /api/stores/:storeId/reports/daily?date=...
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await this.getTransactions(storeId, startDate, endDate);
    const expenses = await this.getExpenses(storeId, startDate, endDate);

    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const totalCost = transactions.reduce((sum, t) => {
      return sum + t.items.reduce((itemSum, item) => itemSum + (item.cost * item.quantity), 0);
    }, 0);
    const grossProfit = totalRevenue - totalCost;
    const totalExpensesAmount = expenses.reduce((sum, e) => sum + (e.approved ? e.amount : 0), 0);
    const netProfit = grossProfit - totalExpensesAmount;

    const topProducts = transactions
      .flatMap(t => t.items)
      .reduce((acc, item) => {
        const existing = acc.find(p => p.productId === item.id);
        if (existing) {
          existing.quantitySold += item.quantity;
          existing.revenue += item.price * item.quantity;
        } else {
          acc.push({
            productId: item.id,
            name: item.name,
            quantitySold: item.quantity,
            revenue: item.price * item.quantity,
          });
        }
        return acc;
      }, [] as any[])
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      storeId,
      date,
      totalTransactions: transactions.length,
      totalRevenue,
      totalCost,
      grossProfit,
      totalExpenses: totalExpensesAmount,
      netProfit,
      topProducts,
    };
  },

  async getStorePerformance(storeId: string, period: 'daily' | 'weekly' | 'monthly' | 'yearly', startDate: Date, endDate: Date): Promise<StorePerformance> {
    // TODO: Implement API call
    // GET /api/stores/:storeId/reports/performance?period=...&startDate=...&endDate=...
    const transactions = await this.getTransactions(storeId, startDate, endDate);
    const expenses = await this.getExpenses(storeId, startDate, endDate);

    const revenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const cost = transactions.reduce((sum, t) => {
      return sum + t.items.reduce((itemSum, item) => itemSum + (item.cost * item.quantity), 0);
    }, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.approved ? e.amount : 0), 0);
    const profit = revenue - cost - totalExpenses;
    const grossMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      storeId,
      storeName: 'Store', // TODO: Get actual store name
      period,
      startDate,
      endDate,
      revenue,
      cost,
      profit,
      grossMargin,
      transactionCount: transactions.length,
      averageTransaction: transactions.length > 0 ? revenue / transactions.length : 0,
      topCategories: [],
    };
  },

  async getMultiStorePerformance(period: 'daily' | 'weekly' | 'monthly' | 'yearly', startDate: Date, endDate: Date): Promise<StorePerformance[]> {
    // TODO: Implement API call
    // GET /api/reports/multi-store-performance?period=...&startDate=...&endDate=...
    return [];
  },
};
