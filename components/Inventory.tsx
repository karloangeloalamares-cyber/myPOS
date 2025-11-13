
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Product } from '../types';
import ProductModal from './ProductModal';
import { TrashIcon, CogIcon } from './icons';
import { useConfirm } from './ConfirmProvider';

interface ExtendedProduct extends Omit<Product, 'categoryId'> {
  categoryId?: string;
}

interface InventoryProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onDeleteMultipleProducts: (productIds: string[]) => void;
  lowStockThreshold: number;
  hideCategory?: boolean;
}

const Inventory: React.FC<InventoryProps> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct, onDeleteMultipleProducts, lowStockThreshold, hideCategory }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'service' | 'menu' | 'ingredient' | 'consumable'>('all');
  const [enabledStatus, setEnabledStatus] = useState<{ [key: string]: boolean }>(() => {
    const stored = localStorage.getItem('product_enabled_status');
    return stored ? JSON.parse(stored) : {};
  });
  const confirm = useConfirm();
  
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  
  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(products.map(p => p.category))];
    return cats;
  }, [products]);

  // Filter products based on category and status
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory;
      const t = (product as any).itemType || 'product';
      const typeMatch = typeFilter === 'all' || t === typeFilter;
      const isOutOfStock = product.stock <= 0;
      const isLowStock = product.stock > 0 && product.stock <= lowStockThreshold && product.stock !== Infinity;
      
      let statusMatch = true;
      switch (statusFilter) {
        case 'in-stock':
          statusMatch = !isOutOfStock && !isLowStock;
          break;
        case 'low-stock':
          statusMatch = isLowStock;
          break;
        case 'out-of-stock':
          statusMatch = isOutOfStock;
          break;
        default:
          statusMatch = true;
      }
      
      return categoryMatch && statusMatch && typeMatch;
    });
  }, [products, selectedCategory, statusFilter, typeFilter, lowStockThreshold]);

  const allSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedProducts.includes(p.id));
  const someSelected = filteredProducts.some(p => selectedProducts.includes(p.id)) && !allSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) {
        headerCheckboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedProducts([...selectedProducts, ...filteredProducts.filter(p => !selectedProducts.includes(p.id)).map(p => p.id)]);
    } else {
        setSelectedProducts(selectedProducts.filter(id => !filteredProducts.find(p => p.id === id)));
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
        prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleToggleEnabled = (productId: string) => {
    const newStatus = !enabledStatus[productId];
    const newEnabledStatus = { ...enabledStatus, [productId]: newStatus };
    setEnabledStatus(newEnabledStatus);
    localStorage.setItem('product_enabled_status', JSON.stringify(newEnabledStatus));
  };

  const handleOpenModal = (product?: Product) => {
    setProductToEdit(product || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductToEdit(null);
  };

  const handleSaveProduct = (productData: Omit<Product, 'id'> | Product) => {
    if ('id' in productData) {
      onUpdateProduct(productData);
    } else {
      onAddProduct(productData);
    }
    handleCloseModal();
  };

  const handleDelete = async (productId: string) => {
    const prod = products.find(p => p.id === productId);
    try {
      await confirm({
        message: `You are about to delete "${prod?.name || 'this item'}". This action cannot be undone.`,
        confirmButtonLabel: 'Delete Item',
      });
      onDeleteProduct(productId);
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    } catch {}
  }

  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) return;
    try {
      await confirm({
        message: `You are about to delete ${selectedProducts.length} selected item(s). This action cannot be undone.`,
        confirmButtonLabel: 'Delete Selected',
      });
      onDeleteMultipleProducts(selectedProducts);
      setSelectedProducts([]);
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { window.history.back(); }}
            className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600"
            aria-label="Back to Main Menu"
          >
            ← Back
          </button>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Item Management</h2>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Add New Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Category</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Items</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>
        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Type</label>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All</option>
            <option value="product">Product</option>
            <option value="service">Service</option>
            <option value="menu">Menu</option>
            <option value="ingredient">Ingredient</option>
            <option value="consumable">Consumable</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        {selectedProducts.length > 0 && (
            <div className="bg-indigo-50 dark:bg-indigo-900/50 p-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                    {selectedProducts.length} item(s) selected
                </span>
                <button 
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                    <TrashIcon className="h-4 w-4" />
                    Delete Selected
                </button>
            </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
              <tr>
                <th scope="col" className="px-4 py-3 w-4">
                    <input 
                        type="checkbox" 
                        ref={headerCheckboxRef}
                        checked={allSelected}
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500"
                        aria-label="Select all products"
                    />
                </th>
                <th scope="col" className="px-6 py-3">Menu Item</th>
                <th scope="col" className="px-6 py-3">Category</th>
                <th scope="col" className="px-6 py-3 text-right">Price</th>
                <th scope="col" className="px-6 py-3 text-right">Cost</th>
                <th scope="col" className="px-6 py-3 text-right">Stock</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No menu items found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isSelected = selectedProducts.includes(product.id);
                  const isOutOfStock = product.stock <= 0;
                  const isLowStock = product.stock > 0 && product.stock <= lowStockThreshold && product.stock !== Infinity;
                  const isEnabled = enabledStatus[product.id] !== false; // Default to enabled
                  
                  let statusBadge = '';
                  let statusColor = '';
                  if (isOutOfStock) {
                    statusBadge = 'Out of Stock';
                    statusColor = 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
                  } else if (isLowStock) {
                    statusBadge = 'Low Stock';
                    statusColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
                  } else {
                    statusBadge = 'In Stock';
                    statusColor = 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
                  }
                  
                  return (
                      <tr key={product.id} className={`border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/50' : 'bg-white dark:bg-slate-800'} ${!isEnabled ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-4">
                          <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => handleSelectProduct(product.id)}
                              className="rounded border-slate-300 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500"
                              aria-label={`Select ${product.name}`}
                          />
                      </td>
                      <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">
                          <div className="flex items-center space-x-3">
                               <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-cover rounded-md" />
                               <span>{product.name}</span>
                               <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 ml-2">
                                 {((product as any).itemType||'product') === 'product' ? '🛍️ Product' : ((product as any).itemType) === 'service' ? '💇 Service' : ((product as any).itemType) === 'menu' ? '🍱 Menu' : ((product as any).itemType) === 'consumable' ? '🧴 Consumable' : '🧂 Ingredient'}
                               </span>
                          </div>
                      </th>
                      <td className="px-6 py-4">{product.category}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-800 dark:text-slate-200">₱{product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">₱{product.cost.toFixed(2)}</td>
                      <td className={`px-6 py-4 text-right font-bold ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-yellow-500' : ''}`}>
                          {product.stock === Infinity ? '∞' : product.stock}
                      </td>
                      <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                              {statusBadge}
                          </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => handleToggleEnabled(product.id)}
                            className={`font-medium px-2 py-1 rounded text-xs ${isEnabled ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900/30'}`}
                            title={isEnabled ? 'Click to disable' : 'Click to enable'}
                          >
                            {isEnabled ? '✓ Enabled' : '✗ Disabled'}
                          </button>
                          <button onClick={() => handleOpenModal(product)} className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline">Edit</button>
                          <button onClick={() => handleDelete(product.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                      </td>
                      </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation handled globally via ConfirmProvider */}
      
      {isModalOpen && (
        <ProductModal
          productToEdit={productToEdit}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
          hideCategory={!!hideCategory}
          allProducts={products}
        />
      )}
    </div>
  );
};

export default Inventory;
