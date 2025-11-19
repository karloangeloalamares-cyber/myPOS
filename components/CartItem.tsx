import React from 'react';
import { CartItem as CartItemType } from '../types';
import { QuantityStepper } from './QuantityStepper';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity }) => {
  // Defensive checks for missing properties
  const price = item.price ?? 0;
  const quantity = item.quantity ?? 1;
  const total = price * quantity;

  return (
    <div className="flex items-center space-x-4">
      <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
      <div className="flex-grow">
        <p className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">₱{price.toFixed(2)}</p>
      </div>
      <div className="flex flex-col items-end space-y-1">
        <p className="font-bold text-slate-900 dark:text-white">₱{total.toFixed(2)}</p>
        <QuantityStepper
          value={quantity}
          onDecrease={() => onUpdateQuantity(item.id, Math.max(1, quantity - 1))}
          onIncrease={() => onUpdateQuantity(item.id, quantity + 1)}
        />
      </div>
    </div>
  );
};

export default CartItem;
