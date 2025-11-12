import { Transaction, Expense, Staff } from '../types';

export interface CommissionSummaryFilter {
  storeId?: string;
  from?: Date;
  to?: Date;
}

export interface CommissionAggregate {
  totalCommission: number;
  byStaff: { key: string; name: string; amount: number }[];
  byItem?: { key: string; name: string; amount: number }[];
}

const isWithinRange = (date: Date, filter: CommissionSummaryFilter): boolean => {
  if (filter.from && date < filter.from) return false;
  if (filter.to && date > filter.to) return false;
  return true;
};

export function getCommissionSummary(
  transactions: Transaction[],
  expenses: Expense[],
  staffList: Staff[] | undefined,
  filter: CommissionSummaryFilter
): CommissionAggregate {
  const filteredExpenses = expenses.filter(expense => {
    if (expense.category !== 'COMMISSIONS') return false;
    if (filter.storeId && expense.storeId !== filter.storeId) return false;
    const expenseDate = new Date((expense as any).createdAt || expense.date);
    return isWithinRange(expenseDate, filter);
  });

  const totalCommission = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  const byStaffMap = new Map<string, { name: string; amount: number }>();

  transactions.forEach(tx => {
    if (!tx.commissionTotal || tx.commissionTotal <= 0) return;
    if (filter.storeId && tx.storeId !== filter.storeId) return;
    const txDate = new Date(tx.timestamp);
    if (!isWithinRange(txDate, filter)) return;

    const key = (tx.staffId || tx.staffName || 'UNASSIGNED') as string;
    let name = (tx.staffName || 'Unassigned / Not Tagged') as string;
    if (tx.staffId && staffList && staffList.length) {
      const found = staffList.find(s => s.id === tx.staffId);
      if (found) name = found.name;
    }
    const existing = byStaffMap.get(key) || { name, amount: 0 };
    existing.amount += tx.commissionTotal;
    byStaffMap.set(key, existing);
  });

  const byStaff = Array.from(byStaffMap.entries()).map(([key, value]) => ({
    key,
    name: value.name,
    amount: value.amount,
  }));

  return {
    totalCommission,
    byStaff,
  };
}
