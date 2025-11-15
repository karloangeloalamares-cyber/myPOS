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
  const [amountTendered, setAmountTendered] = useState('');

  const changeDue = useMemo(() => {
    const tender = parseFloat(amountTendered);
    if (paymentMethod === 'Cash' && !isNaN(tender) && tender >= total) {
      return tender - total;
    }
    return 0;
  }, [paymentMethod, amountTendered, total]);
  
  const canConfirm = useMemo(() => {
    if (paymentMethod === 'Card') return true;
    const tender = parseFloat(amountTendered);
    return !isNaN(tender) && tender >= total;
  }, [paymentMethod, amountTendered, total]);

  const appendKey = (key: string | number) => {
    setAmountTendered(prev => {
      const next = key.toString();
      if (next === '.' && prev.includes('.')) return prev;
      const updated = prev + next;
      if (updated.startsWith('0') && !updated.startsWith('0.')) {
        return updated.replace(/^0+/, '');
      }
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Confirm Order</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="space-y-4 overflow-y-auto pr-2">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">Order Summary</h3>
              {cartItems.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">Cart is empty.</p>
              )}
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

            <div className="space-y-4 overflow-y-auto pl-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">Payment Method</h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setPaymentMethod('Cash')} className={`py-3 rounded-md text-sm font-bold transition-colors ${paymentMethod === 'Cash' ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' : 'bg-white dark:bg-slate-700'}`}>CASH</button>
                <button onClick={() => setPaymentMethod('Card')} className={`py-3 rounded-md text-sm font-bold transition-colors ${paymentMethod === 'Card' ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' : 'bg-white dark:bg-slate-700'}`}>CARD</button>
              </div>

              {paymentMethod === 'Cash' ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Amount Tendered (₱)</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {[1000, 500, 100].map(amount => (
                        <button
                          key={amount}
                          type="button"
                          className={`px-3 py-2 text-sm font-semibold rounded-md border ${amountTendered === amount.toString() ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'}`}
                          onClick={() => setAmountTendered(amount.toString())}
                        >
                          ₱{amount.toLocaleString()}
                        </button>
                      ))}
                      <button
                        type="button"
                        className={`px-3 py-2 text-sm font-semibold rounded-md border ${amountTendered === '' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'}`}
                        onClick={() => setAmountTendered('')}
                      >
                        Custom
                      </button>
                    </div>
                    <input
                      id="amountTendered"
                      type="number"
                      value={amountTendered}
                      onChange={(e) => setAmountTendered(e.target.value)}
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                      placeholder="Enter amount from customer"
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-between text-lg font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 p-3 rounded-md">
                    <span>Change Due</span>
                    <span>₱{changeDue.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1,2,3,4,5,6,7,8,9,'0','.'].map(key => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => appendKey(key)}
                        className="rounded-md border border-slate-300 bg-white py-2 text-base font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        {key}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAmountTendered(prev => prev.slice(0, -1))}
                      className="rounded-md border border-slate-300 bg-white py-2 text-base font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      ⌫
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmountTendered('')}
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-base font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300">Process the card payment externally, then confirm below.</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t dark:border-slate-700 bg-white dark:bg-slate-800">
          <button onClick={() => onConfirm(paymentMethod)} disabled={!canConfirm} className="w-full bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed">
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
