import React, { useMemo, useState } from 'react';
import { CartItem, SettingsData, Staff } from '../types';
import { CloseIcon } from './icons';
import type { TipMethod } from '@/lib/tips';

type PaymentMethod = 'Cash' | 'Card';

interface CheckoutModalProps {
  cartItems: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  settings: SettingsData;
  staff: Staff[];
  onClose: () => void;
  onConfirm: (payment: {
    paymentMethod: PaymentMethod;
    tipAmount?: number;
    tipMethod?: TipMethod;
    allocations?: { staffId: string; amount: number }[];
  }) => void;
}

const TIP_METHODS: TipMethod[] = ['cash', 'card', 'gcash', 'other'];

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  cartItems,
  subtotal,
  tax,
  discount,
  total,
  settings,
  staff,
  onClose,
  onConfirm,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [amountTendered, setAmountTendered] = useState('');
  const [tipAmount, setTipAmount] = useState('');
  const [tipMethod, setTipMethod] = useState<TipMethod>('cash');
  const [assignTipToStaff, setAssignTipToStaff] = useState(false);
  const [allocationRows, setAllocationRows] = useState<
    { id: string; staffId: string; amount: string }[]
  >([]);
  const [showCustomKeypad, setShowCustomKeypad] = useState(false);

  const numericTip = parseFloat(tipAmount || '0');

  const allocationsTotal = assignTipToStaff
    ? allocationRows.reduce((sum, row) => sum + parseFloat(row.amount || '0'), 0)
    : 0;

  const changeDue = useMemo(() => {
    const tender = parseFloat(amountTendered);
    if (paymentMethod === 'Cash' && !isNaN(tender) && tender >= total) {
      return tender - total;
    }
    return 0;
  }, [paymentMethod, amountTendered, total]);

  const canConfirm = useMemo(() => {
    if (paymentMethod === 'Card') return numericTip >= 0;
    const tender = parseFloat(amountTendered);
    return !isNaN(tender) && tender >= total;
  }, [paymentMethod, amountTendered, total, numericTip]);

  const handleKeypadPress = (key: string) => {
    setAmountTendered(prev => {
      if (key === 'C') return '';
      if (key === 'DEL') return prev.slice(0, -1);
      if (key === '.' && prev.includes('.')) return prev;
      const next = prev + key;
      if (next.startsWith('0') && !next.startsWith('0.')) {
        return next.replace(/^0+/, '');
      }
      return next;
    });
  };

  const ensureAtLeastOneRow = () => {
    if (!assignTipToStaff || allocationRows.length > 0 || staff.length === 0) return;
    const firstStaffId = staff[0]?.id;
    if (!firstStaffId) return;
    setAllocationRows([
      {
        id:
          (globalThis.crypto?.randomUUID?.() as string | undefined) ??
          `alloc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        staffId: firstStaffId,
        amount: '',
      },
    ]);
  };

  const addAllocationRow = () => {
    if (!staff.length) return;
    const defaultStaffId = staff[0].id;
    setAllocationRows(prev => [
      ...prev,
      {
        id:
          (globalThis.crypto?.randomUUID?.() as string | undefined) ??
          `alloc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        staffId: defaultStaffId,
        amount: '',
      },
    ]);
  };

  const updateAllocationRow = (
    rowId: string,
    updates: Partial<{ staffId: string; amount: string }>,
  ) => {
    setAllocationRows(prev =>
      prev.map(row => (row.id === rowId ? { ...row, ...updates } : row)),
    );
  };

  const removeAllocationRow = (rowId: string) => {
    setAllocationRows(prev => prev.filter(row => row.id !== rowId));
  };

  const splitTipEvenly = () => {
    if (!assignTipToStaff || numericTip <= 0 || allocationRows.length === 0) return;
    const per = Number((numericTip / allocationRows.length).toFixed(2));
    const shares = allocationRows.map(() => per);
    let remainder = Number((numericTip - per * allocationRows.length).toFixed(2));
    let idx = 0;
    while (Math.abs(remainder) > 0.0001 && allocationRows.length > 0) {
      shares[idx] = Number((shares[idx] + 0.01).toFixed(2));
      remainder = Number((remainder - 0.01).toFixed(2));
      idx = (idx + 1) % allocationRows.length;
    }
    setAllocationRows(prev =>
      prev.map((row, index) => ({
        ...row,
        amount: shares[index].toFixed(2),
      })),
    );
  };

  const tipMismatch =
    assignTipToStaff && numericTip > 0 && Math.abs(allocationsTotal - numericTip) > 0.01;

  const handleConfirm = () => {
    const payload = {
      paymentMethod,
      tipAmount: numericTip > 0 ? numericTip : undefined,
      tipMethod: numericTip > 0 ? tipMethod : undefined,
      allocations:
        numericTip > 0 && assignTipToStaff
          ? allocationRows
              .map(row => ({
                staffId: row.staffId,
                amount: parseFloat(row.amount || '0'),
              }))
              .filter(share => share.amount > 0)
          : undefined,
    };
    onConfirm(payload);
  };

  const renderTipControls = () => (
    <div className="space-y-3 mt-4">
      <label className="block text-xs font-medium text-slate-500 dark:text-slate-300">
        Tip amount
      </label>
      <input
        type="number"
        step="0.01"
        value={tipAmount}
        onChange={e => setTipAmount(e.target.value)}
        placeholder="0.00"
        className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500/40 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
      />
      <div className="flex flex-wrap gap-2">
        {TIP_METHODS.map(method => (
          <button
            key={method}
            type="button"
            className={`px-3 py-1 rounded-md text-xs font-semibold ${
              tipMethod === method
                ? 'bg-indigo-600 text-white'
                : 'border border-slate-300 text-slate-600 dark:text-slate-200'
            }`}
            onClick={() => setTipMethod(method)}
          >
            {method.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3">
        <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-200">
          <input
            type="checkbox"
            checked={assignTipToStaff}
            onChange={e => {
              const checked = e.target.checked;
              setAssignTipToStaff(checked);
              if (checked) ensureAtLeastOneRow();
            }}
            className="h-4 w-4 rounded border border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Assign tip to staff
        </label>
        <button
          type="button"
          onClick={splitTipEvenly}
          disabled={!assignTipToStaff || numericTip <= 0 || allocationRows.length === 0}
          className="text-xs font-semibold text-indigo-600 disabled:text-indigo-300"
        >
          Split tip evenly
        </button>
      </div>
      {assignTipToStaff && (
        <div className="space-y-2">
          {allocationRows.map(row => (
            <div key={row.id} className="flex items-center gap-2">
              <select
                value={row.staffId}
                onChange={e => updateAllocationRow(row.id, { staffId: e.target.value })}
                className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-200"
                aria-label="Select staff for tip allocation"
              >
                {staff.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm text-right focus:border-indigo-500 focus:ring-indigo-500/40 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                value={row.amount}
                onChange={e => updateAllocationRow(row.id, { amount: e.target.value })}
              />
              {allocationRows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAllocationRow(row.id)}
                  className="text-xs text-slate-500 hover:text-red-600"
                  aria-label="Remove staff allocation"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <div className="flex items-center justify-between text-[11px]">
            <p className="text-slate-500 dark:text-slate-400">
              Allocated {allocationsTotal.toFixed(2)} / {numericTip.toFixed(2)}
            </p>
            <button
              type="button"
              onClick={addAllocationRow}
              className="text-xs font-semibold text-indigo-600"
            >
              + Add staff
            </button>
          </div>
        </div>
      )}
      {tipMismatch && (
        <p className="mt-1 text-[11px] text-red-600">
          Allocated amounts must total the tip before confirming.
        </p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Confirm Order</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left column: order summary + tips */}
            <div className="space-y-4 pr-2">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">Order Summary</h3>
              {cartItems.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">Cart is empty.</p>
              )}
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    {item.quantity} x {item.name}
                  </span>
                  <span className="text-slate-800 dark:text-slate-200">
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t border-dashed border-slate-300 dark:border-slate-600 my-2" />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Discount</span>
                  <span className="text-green-600">- ₱{discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Tax ({settings.taxRate}%)
                  </span>
                  <span>₱{tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t border-slate-300 dark:border-slate-600 my-2" />
              <div className="flex justify-between text-2xl font-bold text-slate-800 dark:text-slate-200">
                <span>Total Due</span>
                <span>₱{total.toFixed(2)}</span>
              </div>

              {/* Tips under Total Due */}
              {renderTipControls()}
            </div>

            {/* Right column: payment method + cash/card specifics */}
            <div className="space-y-4 pl-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">Payment Method</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod('Cash')}
                  className={`py-3 rounded-md text-sm font-bold transition-colors ${
                    paymentMethod === 'Cash'
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                      : 'bg-white dark:bg-slate-700'
                  }`}
                >
                  CASH
                </button>
                <button
                  onClick={() => setPaymentMethod('Card')}
                  className={`py-3 rounded-md text-sm font-bold transition-colors ${
                    paymentMethod === 'Card'
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                      : 'bg-white dark:bg-slate-700'
                  }`}
                >
                  CARD
                </button>
              </div>

              {paymentMethod === 'Cash' ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Amount Tendered (₱)
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {[1000, 500, 100].map(amount => (
                        <button
                          key={amount}
                          type="button"
                          className={`px-3 py-2 text-sm font-semibold rounded-md border ${
                            amountTendered === amount.toString()
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200'
                          }`}
                          onClick={() => {
                            setShowCustomKeypad(false);
                            setAmountTendered(amount.toString());
                          }}
                        >
                          ₱{amount.toLocaleString()}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="px-3 py-2 text-sm font-semibold rounded-md border bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                        onClick={() => {
                          setShowCustomKeypad(true);
                          setAmountTendered('');
                        }}
                      >
                        Custom
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 text-sm font-semibold rounded-md border bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                        onClick={() => {
                          setShowCustomKeypad(false);
                          setAmountTendered('');
                        }}
                      >
                        Clear
                      </button>
                    </div>
                    <input
                      id="amountTendered"
                      type="number"
                      value={amountTendered}
                      onChange={e => setAmountTendered(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                      placeholder="Enter amount from customer"
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-between text-lg font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 p-3 rounded-md">
                    <span>Change Due</span>
                    <span>₱{changeDue.toFixed(2)}</span>
                  </div>

                  {showCustomKeypad && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {['1','2','3','4','5','6','7','8','9','0','.','DEL'].map(key => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleKeypadPress(key)}
                          className="py-2 rounded-md border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-600"
                        >
                          {key === 'DEL' ? '⌫' : key}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Process the card payment externally, then confirm below.
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 border-t dark:border-slate-700 bg-white dark:bg-slate-800">
          <button
            onClick={handleConfirm}
            disabled={
              !canConfirm ||
              (assignTipToStaff && numericTip > 0 && Math.abs(allocationsTotal - numericTip) > 0.01)
            }
            className="w-full bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
