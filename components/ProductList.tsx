import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  lowStockThreshold: number;
  showExpiryBadge?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ products, onProductClick, lowStockThreshold, showExpiryBadge }) => {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-8 gap-2">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onCardClick={onProductClick}
          lowStockThreshold={lowStockThreshold}
          showExpiryBadge={showExpiryBadge}
        />
      ))}
    </div>
  );
};

export default ProductList;
