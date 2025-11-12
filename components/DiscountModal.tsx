import React, { useState, useMemo, useEffect } from 'react';
import { CloseIcon } from './icons';
import { Discount } from '../types';

interface DiscountModalProps {
  onClose: () => void;
  onApply: (discount: Discount) => void;
  subtotal: number;
  currentDiscount: Discount | null;
}

type DiscountType = 'pwd' | 'manager';
type ManagerDiscountType = 'percent' | 'fixed';

const DiscountModal: React.FC<DiscountModalProps> = ({ onClose, onApply, subtotal, currentDiscount }) => {
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountType>('pwd');
  const [managerType, setManagerType] = useState<ManagerDiscountType>('percent');
  const [managerValue, setManagerValue] = useState<number | ''>('');

  useEffect(() => {
    if (currentDiscount) {
        if (currentDiscount.type === 'percent' && currentDiscount.value === 20) {
            setSelectedDiscount('pwd');
        } else {
            setSelectedDiscount('manager');
            setManagerType(currentDiscount.type);
            setManagerValue(currentDiscount.value);
        }
    }
  }, [currentDiscount]);

  const calculatedDiscountAmount = useMemo(() => {
    if (selectedDiscount === 'pwd') {
      return subtotal * 0.20;
    }
    // Manager's discount
    if (managerValue === '' || managerValue < 0) return 0;
    if (managerType === 'percent') {
      const discount = subtotal * (managerValue / 100);
      return Math.min(subtotal, discount);
    }
    return Math.min(subtotal, managerValue);
  }, [selectedDiscount, managerType, managerValue, subtotal]);

  const handleApply = () => {
    if (selectedDiscount === 'pwd') {
        onApply({ type: 'percent', value: 20 });
    } else {
        if(managerValue !== '' && managerValue > 0) {
            onApply({ type: managerType, value: managerValue });
        }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Apply Discount</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Discount Type</p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setSelectedDiscount('pwd')}
                className={`py-3 rounded-md text-sm font-bold transition-colors ${selectedDiscount === 'pwd' ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' : 'bg-white dark:bg-slate-700'}`}
              >
                PWD Discount (20%)
              </button>
              <button 
                onClick={() => setSelectedDiscount('manager')}
                className={`py-3 rounded-md text-sm font-bold transition-colors ${selectedDiscount === 'manager' ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' : 'bg-white dark:bg-slate-700'}`}
              >
                Manager's Discount
              </button>
            </div>
          </div>
          
          {selectedDiscount === 'manager' && (
             <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-4">
                <div className="flex rounded-md shadow-sm">
                    <button onClick={() => setManagerType('percent')} className={`px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-l-md text-sm font-medium transition-colors ${managerType === 'percent' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>Percent (%)</button>
                    <button onClick={() => setManagerType('fixed')} className={`px-4 py-2 border-y border-r border-slate-300 dark:border-slate-600 rounded-r-md text-sm font-medium transition-colors ${managerType === 'fixed' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>Fixed (₱)</button>
                </div>
                <input
                    type="number"
                    value={managerValue}
                    onChange={(e) => setManagerValue(parseFloat(e.target.value) || '')}
                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                    placeholder={managerType === 'percent' ? 'e.g., 10 for 10%' : 'e.g., 50 for ₱50'}
                    min="0"
                    autoFocus
                />
             </div>
          )}

          <div className="text-center bg-indigo-50 dark:bg-indigo-900/50 p-3 rounded-md">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Discount to be applied:
            </p>
            <p className="font-bold text-xl text-indigo-600 dark:text-indigo-300">
                ₱{calculatedDiscountAmount.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-end">
          <button onClick={handleApply} className="w-full px-4 py-3 text-sm font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Apply Discount</button>
        </div>
      </div>
    </div>
  );
};

export default DiscountModal;