import React, { useState, useMemo } from 'react';
import { CartItem, SettingsData } from '../types';
import { CloseIcon } from './icons';

interface CheckoutModalProps {
  cartItems: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  settings: SettingsData;
  onClose: () => void;
  onConfirm: (paymentMethod: 'Cash' | 'Card') => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ cartItems, subtotal, tax, discount, total, settings, onClose, onConfirm }) => {
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card'>('Cash');
  const [amountTendered, setAmountTendered] = useState<number | ''>('');

  const changeDue = useMemo(() => {
    if (paymentMethod === 'Cash' && typeof amountTendered === 'number' && amountTendered >= total) {
      return amountTendered - total;
    }
    return 0;
  }, [paymentMethod, amountTendered, total]);
  
  const canConfirm = useMemo(() => {
    if (paymentMethod === 'Card') return true;
    return typeof amountTendered === 'number' && amountTendered >= total;
  }, [paymentMethod, amountTendered, total]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Confirm Order</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300">Order Summary</h3>
          {cartItems.map(item => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">{item.quantity} x {item.name}</span>
              <span className="text-slate-800 dark:text-slate-200">₱{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-dashed border-slate-300 dark:border-slate-600 my-2"></div>
          <div className="space-y-1 text-sm">
             <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Subtotal</span><span>₱{subtotal.toFixed(2)}</span></div>
             <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Discount</span><span className="text-green-600">- ₱{discount.toFixed(2)}</span></div>
             <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Tax ({settings.taxRate}%)</span><span>₱{tax.toFixed(2)}</span></div>
          </div>
          <div className="border-t border-slate-300 dark:border-slate-600 my-2"></div>
          <div className="flex justify-between text-2xl font-bold text-slate-800 dark:text-slate-200">
            <span>Total Due</span>
            <span>₱{total.toFixed(2)}</span>
          </div>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 space-y-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Payment Method</h3>
            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setPaymentMethod('Cash')} className={`py-3 rounded-md text-sm font-bold transition-colors ${paymentMethod === 'Cash' ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' : 'bg-white dark:bg-slate-700'}`}>CASH</button>
                <button onClick={() => setPaymentMethod('Card')} className={`py-3 rounded-md text-sm font-bold transition-colors ${paymentMethod === 'Card' ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' : 'bg-white dark:bg-slate-700'}`}>CARD</button>
            </div>
            
            {paymentMethod === 'Cash' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="amountTendered" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount Tendered (₱)</label>
                  <input
                    id="amountTendered"
                    type="number"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(parseFloat(e.target.value) || '')}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                    placeholder="Enter amount from customer"
                    autoFocus
                  />
                </div>
                <div className="flex justify-between text-lg font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 p-3 rounded-md">
                    <span>Change Due</span>
                    <span>₱{changeDue.toFixed(2)}</span>
                </div>
              </div>
            )}

            <button onClick={() => onConfirm(paymentMethod)} disabled={!canConfirm} className="w-full bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed">
                Confirm Payment
            </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;