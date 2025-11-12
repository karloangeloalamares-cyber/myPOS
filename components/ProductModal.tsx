import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { CloseIcon } from './icons';

interface ProductModalProps {
  productToEdit?: Product | null;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'> | Product) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ productToEdit, onClose, onSave }) => {
  const [product, setProduct] = useState({
    name: '',
    price: 0,
    cost: 0,
    stock: Infinity,
    imageUrl: '',
    description: '',
    category: 'Main Courses',
    isCommissionable: false,
    commissionRate: null as number | null,
  });

  useEffect(() => {
    if (productToEdit) {
      setProduct({
        ...productToEdit,
        isCommissionable: !!productToEdit.isCommissionable,
        commissionRate: typeof productToEdit.commissionRate === 'number'
          ? productToEdit.commissionRate
          : null,
      });
    } else {
      setProduct({
        name: '', price: 0, cost: 0, stock: Infinity, imageUrl: 'https://picsum.photos/400/300', description: '', category: 'Main Courses', isCommissionable: false, commissionRate: null
      });
    }
  }, [productToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleCommissionRateChange = (value: string) => {
    const percent = Number(value);
    setProduct(prev => ({
      ...prev,
      commissionRate: !isNaN(percent) && percent > 0 ? percent / 100 : null,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextProduct = { ...product };

    if (nextProduct.isCommissionable) {
      if (!nextProduct.commissionRate || nextProduct.commissionRate <= 0) {
        alert('Please set a valid commission rate (e.g. 5, 10, 35).');
        return;
      }
    } else {
      nextProduct.commissionRate = null;
    }

    const payload = productToEdit ? { ...nextProduct, id: productToEdit.id } : nextProduct;
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden relative">
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            {productToEdit ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Item Name" name="name" value={product.name} onChange={handleChange} required />
                <div>
                     <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                    <select id="category" name="category" value={product.category} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                        <option>Appetizers</option>
                        <option>Main Courses</option>
                        <option>Desserts</option>
                        <option>Drinks</option>
                    </select>
                </div>
            </div>
             <FormInput label="Image URL" name="imageUrl" value={product.imageUrl} onChange={handleChange} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput label="Price (₱)" name="price" type="number" value={product.price} onChange={handleChange} required min="0" step="0.01"/>
                <FormInput label="Cost (₱)" name="cost" type="number" value={product.cost} onChange={handleChange} required min="0" step="0.01"/>
                <FormInput label="Stock (∞ for unlimited)" name="stock" type="number" value={product.stock} onChange={handleChange} required min="0" />
            </div>
            <div>
                 <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={product.description}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                />
            </div>
            <div className="space-y-2 border-t border-slate-200 pt-4">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={!!product.isCommissionable}
                  onChange={(e) =>
                    setProduct(prev => ({
                      ...prev,
                      isCommissionable: e.target.checked,
                      commissionRate: e.target.checked ? prev.commissionRate : null,
                    }))
                  }
                  className="h-4 w-4 text-indigo-600 border-slate-300 rounded"
                />
                Enable commission for this item
              </label>
              {product.isCommissionable && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Commission Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={product.commissionRate ? (product.commissionRate * 100).toString() : ''}
                    onChange={(e) => handleCommissionRateChange(e.target.value)}
                    placeholder="e.g., 5, 10, 35"
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Percentage of this item’s sales paid as commission.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white rounded-md border border-slate-300 hover:bg-slate-50 dark:text-slate-300 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
              Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, name, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <input
            id={name}
            name={name}
            {...props}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
        />
    </div>
);

export default ProductModal;
