import React from 'react';
import { DollarIcon, PackageIcon, ReceiptIcon } from './icons';

interface DashboardProps {
  title: string;
  metrics: {
    totalRevenue: number;
    itemsSold: number;
    transactions: number;
    totalCogs: number;
  };
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow flex items-center">
      <div className={`p-3 rounded-full mr-4 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ title, metrics }) => {
  const safeMetrics = {
    totalRevenue: isNaN(metrics.totalRevenue) ? 0 : metrics.totalRevenue,
    totalCogs: isNaN(metrics.totalCogs) ? 0 : metrics.totalCogs,
    itemsSold: isNaN(metrics.itemsSold) ? 0 : metrics.itemsSold,
    transactions: isNaN(metrics.transactions) ? 0 : metrics.transactions,
  };
  
  const grossProfit = safeMetrics.totalRevenue - safeMetrics.totalCogs;
  
  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-3">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₱${safeMetrics.totalRevenue.toFixed(2)}`}
          icon={<DollarIcon className="h-6 w-6 text-green-800" />}
          color="bg-green-100 dark:bg-green-900/50"
        />
        <StatCard
          title="Total COGS"
          value={`₱${safeMetrics.totalCogs.toFixed(2)}`}
          icon={<DollarIcon className="h-6 w-6 text-red-800" />}
          color="bg-red-100 dark:bg-red-900/50"
        />
         <StatCard
          title="Gross Profit"
          value={`₱${grossProfit.toFixed(2)}`}
          icon={<DollarIcon className="h-6 w-6 text-emerald-800" />}
          color="bg-emerald-100 dark:bg-emerald-900/50"
        />
        <StatCard
          title="Items Sold"
          value={safeMetrics.itemsSold}
          icon={<PackageIcon className="h-6 w-6 text-blue-800" />}
          color="bg-blue-100 dark:bg-blue-900/50"
        />
        <StatCard
          title="Transactions"
          value={safeMetrics.transactions}
          icon={<ReceiptIcon className="h-6 w-6 text-indigo-800" />}
          color="bg-indigo-100 dark:bg-indigo-900/50"
        />
      </div>
    </div>
  );
};

export default Dashboard;