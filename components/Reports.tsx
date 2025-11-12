import React, { useMemo, useState } from 'react';
import { Transaction, Expense } from '../types';
import Dashboard from './Dashboard';
import ExpenseModal from './ExpenseModal';
import { DownloadIcon, PlusCircleIcon } from './icons';
import CommissionSummary from './CommissionSummary';

interface ReportsProps {
  transactions: Transaction[];
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  stores?: { id: string; name: string }[];
  currentStoreId?: string | null;
  onStoreFilterChange?: (storeId: string | 'all') => void;
}

type FilterPeriod = 'today' | '7d' | '30d' | 'custom';

const Reports: React.FC<ReportsProps> = ({ transactions, expenses, onAddExpense, stores, currentStoreId, onStoreFilterChange }) => {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'COMMISSIONS'>('SUMMARY');
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('today');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [storeFilter, setStoreFilter] = useState<string>(currentStoreId || 'all');
  const availableStores = stores || [];

  // First level: filter by store
  const storeFilteredTx = useMemo(
    () => storeFilter === 'all'
      ? transactions
      : transactions.filter(tx => tx.storeId === storeFilter),
    [transactions, storeFilter]
  );

  const storeFilteredExpenses = useMemo(
    () => storeFilter === 'all'
      ? expenses
      : expenses.filter(ex => ex.storeId === storeFilter),
    [expenses, storeFilter]
  );

  // Second level: filter by date
  const { filteredTransactions, filteredExpenses, dateRangeTitle } = useMemo(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (filterPeriod) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case '7d':
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case '30d':
        start.setDate(now.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'custom':
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        break;
    }

    const ft = storeFilteredTx.filter(tx => new Date(tx.timestamp) >= start && new Date(tx.timestamp) <= end);
    const fe = storeFilteredExpenses.filter(ex => new Date(ex.date) >= start && new Date(ex.date) <= end);
    
    const title = filterPeriod === 'today' ? "Today's Summary" : `Summary for ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;

    return { filteredTransactions: ft, filteredExpenses: fe, dateRangeTitle: title };
  }, [storeFilteredTx, storeFilteredExpenses, filterPeriod, startDate, endDate]);

  const metrics = useMemo(() => {
    const result = filteredTransactions.reduce((acc, tx) => {
      acc.totalRevenue += tx.total || 0;
      acc.transactions += 1;
      tx.items.forEach(item => {
        acc.itemsSold += item.quantity || 0;
        acc.totalCogs += (item.cost || 0) * (item.quantity || 0);
      });
      return acc;
    }, { totalRevenue: 0, itemsSold: 0, transactions: 0, totalCogs: 0 });
    
    // Ensure no NaN values
    return {
      totalRevenue: isNaN(result.totalRevenue) ? 0 : result.totalRevenue,
      itemsSold: isNaN(result.itemsSold) ? 0 : result.itemsSold,
      transactions: isNaN(result.transactions) ? 0 : result.transactions,
      totalCogs: isNaN(result.totalCogs) ? 0 : result.totalCogs
    };
  }, [filteredTransactions]);

  const { totalCommissions, totalOtherExpenses, totalExpenses } = useMemo(() => {
    const totals = filteredExpenses.reduce(
      (acc, expense) => {
        const amount = expense.amount || 0;
        if (expense.category === 'COMMISSIONS') {
          acc.totalCommissions += amount;
        } else {
          acc.totalOtherExpenses += amount;
        }
        return acc;
      },
      { totalCommissions: 0, totalOtherExpenses: 0 }
    );
    // Commissions are recorded as operating expenses, not deducted from revenue.
    return {
      totalCommissions: totals.totalCommissions,
      totalOtherExpenses: totals.totalOtherExpenses,
      totalExpenses: totals.totalCommissions + totals.totalOtherExpenses,
    };
  }, [filteredExpenses]);
  
  const netProfit = useMemo(() => {
    const profit = metrics.totalRevenue - metrics.totalCogs - totalExpenses;
    return isNaN(profit) ? 0 : profit;
  }, [metrics, totalExpenses]);

  const handleSaveExpense = (expense: Omit<Expense, 'id'>) => {
    onAddExpense(expense);
    setIsExpenseModalOpen(false);
  };
  
  const handleDownloadCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Type,Description,Category,Amount\n";

    const rows = [
      ...filteredTransactions.map(tx => [
        new Date(tx.timestamp).toLocaleString(),
        'Sale',
        `Order #${tx.id.slice(-6)} (${tx.items.length} items)`,
        '',
        tx.total.toFixed(2)
      ]),
      ...filteredExpenses.map(ex => [
        new Date(ex.date).toLocaleString(),
        'Expense',
        ex.description,
        ex.category,
        (-ex.amount).toFixed(2)
      ])
    ];

    rows.sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

    rows.forEach(rowArray => {
      let row = rowArray.join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { window.history.back(); }}
            className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600"
            aria-label="Back to Main Menu"
          >
            ← Back
          </button>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Reports</h2>
        </div>

        {activeTab === 'SUMMARY' && (
          <div className="flex items-center flex-wrap gap-2">
            {(['today', '7d', '30d', 'custom'] as FilterPeriod[]).map(period => (
              <button key={period} onClick={() => setFilterPeriod(period)} className={`px-4 py-2 text-sm font-semibold rounded-md whitespace-nowrap transition-colors duration-200 ${filterPeriod === period ? 'bg-indigo-600 text-white shadow' : 'bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
                {period === 'today' ? 'Today' : period === '7d' ? 'Last 7 Days' : period === '30d' ? 'Last 30 Days' : 'Custom'}
              </button>
            ))}

            <button onClick={handleDownloadCsv} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              <DownloadIcon className="h-4 w-4" /> Download Report
            </button>

            <button onClick={() => setIsExpenseModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
              <PlusCircleIcon className="h-4 w-4" /> Log Expense
            </button>
          </div>
        )}
      </div>
      
      <div className="flex gap-3 border-b border-slate-200 dark:border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('SUMMARY')}
          className={`px-4 py-2 rounded-md text-sm font-semibold ${
            activeTab === 'SUMMARY'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Sales & Profit
        </button>
        <button
          onClick={() => setActiveTab('COMMISSIONS')}
          className={`px-4 py-2 rounded-md text-sm font-semibold ${
            activeTab === 'COMMISSIONS'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Commission Summary
        </button>
      </div>

      {activeTab === 'SUMMARY' ? (
        <>
      {availableStores.length > 0 && (
        <div className="mb-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mr-2">Store:</label>
          <select
            className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md px-2 py-1 text-sm"
            value={storeFilter}
            onChange={e => {
              const value = e.target.value;
              setStoreFilter(value);
              onStoreFilterChange?.(value as any);
            }}
          >
            <option value="all">All Stores</option>
            {availableStores.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}
      
      {filterPeriod === 'custom' && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Start Date:
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                End Date:
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
            </label>
        </div>
      )}

      <Dashboard title={dateRangeTitle} metrics={metrics} />

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-4">Profit & Loss Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Gross Profit</p>
                <p className="text-2xl font-bold text-green-600">PHP {(metrics.totalRevenue - metrics.totalCogs).toFixed(2)}</p>
                <p className="text-xs text-slate-400">Total Revenue - COGS</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Commissions</p>
                <p className="text-2xl font-bold text-amber-600">- PHP {totalCommissions.toFixed(2)}</p>
                <p className="text-xs text-slate-400">Auto-posted commission expenses</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">- PHP {totalExpenses.toFixed(2)}</p>
                <p className="text-xs text-slate-400">Commissions + other operating expenses</p>
            </div>
            <div className={`bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border-t-4 ${netProfit >= 0 ? 'border-green-500' : 'border-red-500'}`}>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Net Profit</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">PHP {netProfit.toFixed(2)}</p>
                 <p className="text-xs text-slate-400">Gross Profit - (Commissions + Other Expenses)</p>
            </div>
        </div>
      </div>
      
       {isExpenseModalOpen && (
        <ExpenseModal 
            onClose={() => setIsExpenseModalOpen(false)} 
            onSave={handleSaveExpense}
        />
      )}
        </>
      ) : (
        <CommissionSummary
          stores={availableStores}
          transactions={transactions}
          expenses={expenses}
          currentStoreId={currentStoreId}
        />
      )}
    </div>
  );
};

export default Reports;
