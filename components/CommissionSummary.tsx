import React, { useMemo, useState } from 'react';
import { Expense, Transaction, Staff } from '../types';
import { getCommissionSummary } from '../services/commissionService';
import { staffService } from '../services/staffService';

type FilterPeriod = 'today' | '7d' | '30d' | 'custom';

interface CommissionSummaryProps {
  stores: { id: string; name: string }[];
  transactions: Transaction[];
  expenses: Expense[];
  currentStoreId?: string | null;
}

const CommissionSummary: React.FC<CommissionSummaryProps> = ({
  stores,
  transactions,
  expenses,
  currentStoreId,
}) => {
  const [staff, setStaff] = useState<Staff[]>(() => staffService.getAll());
  const [storeFilter, setStoreFilter] = useState<string>(currentStoreId || 'all');
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('today');
  const [customStart, setCustomStart] = useState(new Date().toISOString().split('T')[0]);
  const [customEnd, setCustomEnd] = useState(new Date().toISOString().split('T')[0]);

  const { from, to, label } = useMemo(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (filterPeriod) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case '7d':
        start = new Date(now);
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case '30d':
        start = new Date(now);
        start.setDate(start.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'custom':
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        break;
    }

    const rangeLabel =
      filterPeriod === 'today'
        ? "Today's Commissions"
        : `Commissions for ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;

    return { from: start, to: end, label: rangeLabel };
  }, [filterPeriod, customStart, customEnd]);

  const filter = useMemo(
    () => ({
      storeId: storeFilter === 'all' ? undefined : storeFilter,
      from,
      to,
    }),
    [storeFilter, from, to]
  );

  const summary = useMemo(
    () => getCommissionSummary(transactions, expenses, staff, filter),
    [transactions, expenses, staff, filter]
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
            Store
          </label>
          <select
            className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md px-3 py-2 text-sm"
            value={storeFilter}
            onChange={e => setStoreFilter(e.target.value)}
          >
            <option value="all">All Stores</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['today', '7d', '30d', 'custom'] as FilterPeriod[]).map(period => (
            <button
              key={period}
              onClick={() => setFilterPeriod(period)}
              className={`px-3 py-2 rounded-md text-sm font-medium border ${
                filterPeriod === period
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
              }`}
            >
              {period === 'today'
                ? 'Today'
                : period === '7d'
                ? 'Last 7 Days'
                : period === '30d'
                ? 'Last 30 Days'
                : 'Custom'}
            </button>
          ))}
        </div>
        {filterPeriod === 'custom' && (
          <div className="flex flex-wrap gap-4">
            <label className="flex flex-col text-sm font-medium text-slate-600 dark:text-slate-300">
              Start Date
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="mt-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-slate-600 dark:text-slate-300">
              End Date
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="mt-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2"
              />
            </label>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Commission Summary</h3>
          <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Note: Commissions are treated as Operating Expenses. Total sales are reported in full
          under Revenue, and commissions are shown separately for transparency.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Commissions
            </p>
            <p className="text-3xl font-bold text-amber-600">PHP {summary.totalCommission.toFixed(2)}</p>
            <p className="text-xs text-slate-400">Auto-posted commission expenses</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h4 className="text-md font-semibold text-slate-700 dark:text-slate-200">
            Commissions by Staff
          </h4>
        </div>
        <div className="overflow-x-auto">
          {summary.byStaff.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Total Commission
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {summary.byStaff.map(row => (
                  <tr key={row.key}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-200">
                      {row.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">
                      PHP {row.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No commission records found for the selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommissionSummary;
