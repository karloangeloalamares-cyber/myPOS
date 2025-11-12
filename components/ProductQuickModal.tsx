import React, { useState } from 'react';
import { Product } from '../types';

interface ProductQuickModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (quantity: number) => void;
}

const ProductQuickModal: React.FC<ProductQuickModalProps> = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = product.stock <= 0;
  const maxQuantity = product.stock === Infinity ? 999 : product.stock;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1));
    setQuantity(value);
  };

  const handleAddToCart = () => {
    onAddToCart(quantity);
    onClose();
  };

  const handleIncrement = () => {
    setQuantity(prev => Math.min(prev + 1, maxQuantity));
  };

  const handleDecrement = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 space-y-6">
        {/* Product Image and Info */}
        <div>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-40 object-cover rounded-lg mb-4"
          />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {product.name}
          </h2>
          {product.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {product.description}
            </p>
          )}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-3xl font-bold text-indigo-600">₱{product.price.toFixed(2)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cost: ₱{product.cost.toFixed(2)}</p>
            </div>
            {product.stock !== Infinity && (
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Stock</p>
                <p className={`text-lg font-bold ${product.stock <= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {product.stock}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quantity Selector */}
        {!isOutOfStock && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDecrement}
                  className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="flex-grow text-center text-lg font-bold border-2 border-indigo-600 rounded-lg dark:bg-slate-700 dark:text-white dark:border-indigo-500 px-3 py-2"
                  min="1"
                  max={maxQuantity}
                />
                <button
                  onClick={handleIncrement}
                  className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  disabled={quantity >= maxQuantity}
                >
                  +
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add to Order ({quantity})
              </button>
            </div>
          </div>
        )}

        {/* Out of Stock Message */}
        {isOutOfStock && (
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold text-red-600">Out of Stock</p>
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductQuickModal;
