import React from 'react';
import { CartItem as CartItemType, SettingsData } from '../types';
import CartItem from './CartItem';
import { TrashIcon, TagIcon } from './icons';

interface CartProps {
  items: CartItemType[];
  settings: SettingsData;
  discount: number;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  onOpenDiscountModal: () => void;
}

const Cart: React.FC<CartProps> = ({ items, settings, discount, onUpdateQuantity, onClearCart, onCheckout, onOpenDiscountModal }) => {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountedSubtotal = subtotal - discount;
  const tax = discountedSubtotal * (settings.taxRate / 100);
  const total = discountedSubtotal + tax;
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Current Order</h2>
        <button
          onClick={onClearCart}
          disabled={items.length === 0}
          className="p-2 text-slate-500 hover:text-red-600 disabled:opacity-50 disabled:hover:text-slate-500 dark:text-slate-400 dark:hover:text-red-500"
          aria-label="Clear order"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {items.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-10">Your order is empty.</p>
        ) : (
          items.map(item => <CartItem key={item.id} item={item} onUpdateQuantity={onUpdateQuantity} />)
        )}
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">₱{subtotal.toFixed(2)}</span>
        </div>
         <div className="flex justify-between text-sm items-center">
            <div className="flex items-center space-x-1">
                 <span className="text-slate-600 dark:text-slate-400">Discount</span>
                 <button onClick={onOpenDiscountModal} className="text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1" disabled={items.length === 0}>
                    <TagIcon className="w-4 h-4" />
                    <span>{discount > 0 ? 'Edit' : 'Add'}</span>
                </button>
            </div>
            <span className="font-medium text-green-600">- ₱{discount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Tax ({settings.taxRate}%)</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">₱{tax.toFixed(2)}</span>
        </div>
        <div className="border-t border-dashed border-slate-300 dark:border-slate-600 my-2"></div>
        <div className="flex justify-between text-lg font-bold">
          <span className="text-slate-800 dark:text-slate-200">Total</span>
          <span className="text-indigo-600 dark:text-indigo-400">₱{total.toFixed(2)}</span>
        </div>
        <button
          onClick={onCheckout}
          disabled={items.length === 0 || total < 0}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed dark:disabled:bg-indigo-800 transition-colors"
        >
          Place Order & Pay
        </button>
      </div>
    </div>
  );
};

export default Cart;