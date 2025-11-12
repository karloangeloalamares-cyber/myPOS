import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onCardClick: (product: Product) => void;
  lowStockThreshold: number;
  showExpiryBadge?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onCardClick, lowStockThreshold, showExpiryBadge }) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= lowStockThreshold && product.stock !== Infinity;
  const expiryDateStr = (product as any)?.metadata?.expiryDate as string | undefined;
  let isNearExpiry = false;
  if (showExpiryBadge && expiryDateStr) {
    const now = new Date();
    const exp = new Date(expiryDateStr);
    const days = (exp.getTime() - now.getTime()) / (1000*60*60*24);
    isNearExpiry = days <= 30; // within 30 days
  }

  return (
    <div
      onClick={() => onCardClick(product)}
      aria-label={product.name}
      className={`relative group bg-white dark:bg-slate-800 rounded-lg shadow-md flex flex-col transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg hover:scale-105
        ${isOutOfStock ? 'opacity-60 grayscale' : ''}
        ${isLowStock ? 'ring-2 ring-yellow-400' : ''}`
      }
    >
      <div className="relative rounded-t-lg overflow-hidden">
        <img src={product.imageUrl} alt={product.name} className="w-full h-24 object-cover" />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-1">
            <span className="text-white font-bold text-xs text-center bg-red-600 px-2 py-1 rounded">UNAVAILABLE</span>
          </div>
        )}
        {isLowStock && (
           <div className="absolute top-1 left-1 bg-yellow-400 text-yellow-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10">
            LOW
          </div>
        )}
        {isNearExpiry && (
          <div className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10">
            EXPIRING
          </div>
        )}
      </div>
      <div className="p-2 text-left flex-grow flex flex-col">
        <div className="relative flex-grow">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate cursor-help" title={product.name}>
              {product.name}
            </h3>
            {product.description && (
              <div role="tooltip" className="absolute bottom-full left-1/2 z-30 -translate-x-1/2 mb-2 w-56 p-3 text-sm font-normal text-white bg-slate-900 dark:bg-black rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 pointer-events-none">
                {product.description}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900 dark:border-t-black"></div>
              </div>
            )}
        </div>
        <div className="mt-1">
          <p className="text-base font-bold text-slate-900 dark:text-white">₱{product.price.toFixed(2)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Cost: ₱{product.cost.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
