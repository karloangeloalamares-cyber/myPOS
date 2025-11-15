import React from 'react';
import ModuleBackButton from '../../components/ModuleBackButton';
import CommissionSummary from '../../components/CommissionSummary';
import { Store, Transaction, Expense } from '../../types';

interface CommissionsPageProps {
  stores: Store[];
  transactions: Transaction[];
  expenses: Expense[];
  currentStoreId?: string | null;
}

export default function CommissionsPage({
  stores,
  transactions,
  expenses,
  currentStoreId,
}: CommissionsPageProps){
  const storeOptions = stores.map(store => ({
    id: store.id,
    name: store.settings?.storeName || store.name,
  }));

  return (
    <div className="p-4 space-y-3">
      <ModuleBackButton />
      <CommissionSummary
        stores={storeOptions}
        transactions={transactions}
        expenses={expenses}
        currentStoreId={currentStoreId}
      />
    </div>
  );
}
