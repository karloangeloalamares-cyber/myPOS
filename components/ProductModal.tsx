import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { CloseIcon } from './icons';

interface ProductModalProps {
  productToEdit?: Product | null;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'> | Product) => void;
  hideCategory?: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({ productToEdit, onClose, onSave, hideCategory = false }) => {
  const [product, setProduct] = useState({
    name: '',
    price: 0,
    cost: 0,
    stock: Infinity as number,
    imageUrl: '',
    description: '',
    category: 'Main Courses',
    isCommissionable: false,
    commissionRate: null as number | null,
    itemType: 'product' as 'product' | 'service' | 'menu' | 'ingredient',
  });

  useEffect(() => {
    if (productToEdit) {
      setProduct({
        ...productToEdit,
        isCommissionable: !!productToEdit.isCommissionable,
        commissionRate: typeof (productToEdit as any).commissionRate === 'number' ? (productToEdit as any).commissionRate : null,
        itemType: (productToEdit as any).itemType || 'product',
      } as any);
    } else {
      setProduct({
        name: '',
        price: 0,
        cost: 0,
        stock: Infinity,
        imageUrl: 'https://picsum.photos/400/300',
        description: '',
        category: 'Main Courses',
        isCommissionable: false,
        commissionRate: null,
        itemType: 'product',
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
    const nextProduct = { ...product } as any;
    if (!String(nextProduct.name || '').trim()) {
      alert('Please enter an item name.');
      return;
    }
    if (nextProduct.isCommissionable) {
      if (!nextProduct.commissionRate || nextProduct.commissionRate <= 0) {
        alert('Please set a valid commission rate (e.g. 5, 10, 35).');
        return;
      }
    } else {
      nextProduct.commissionRate = null;
    }
    onSave(productToEdit ? { ...nextProduct, id: (productToEdit as any).id } : nextProduct);
  };

  // Image upload helpers
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const onPickImage = () => fileInputRef.current?.click();
  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProduct(prev => ({ ...prev, imageUrl: String(reader.result || '') }));
    reader.readAsDataURL(file);
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProduct(prev => ({ ...prev, imageUrl: String(reader.result || '') }));
    reader.readAsDataURL(file);
  };

  const itemType = (product as any).itemType || 'product';
  const isService = itemType === 'service';
  const isUnlimited = isService || product.stock === Infinity;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl overflow-hidden relative">
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{productToEdit ? 'Edit Item' : 'Add New Item'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Small photo uploader pinned on top */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Photo</label>
              <div
                className={`rounded-lg border-2 ${isDragging ? 'border-indigo-500' : 'border-dashed border-slate-300 dark:border-slate-600'} p-2 bg-slate-50 dark:bg-slate-700/30 min-h-[96px] max-w-[240px] flex items-center justify-center cursor-pointer`}
                onClick={onPickImage}
                onDragOver={(e)=>{e.preventDefault(); setIsDragging(true);}}
                onDragLeave={()=> setIsDragging(false)}
                onDrop={onDrop}
                title="Click or drop an image"
              >
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt="Preview" className="max-h-24 object-contain rounded-md" />
                ) : (
                  <div className="text-center text-slate-500 dark:text-slate-400">
                    <div className="text-xs">Upload</div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
              </div>
            </div>

            {/* Item + Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Item Name" name="name" value={product.name} onChange={handleChange} required />
              {!hideCategory && (
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                  <select id="category" name="category" value={product.category} onChange={handleChange} className="mt-1 block w-full h-11 rounded-lg border-2 border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                    <option>Appetizers</option>
                    <option>Main Courses</option>
                    <option>Desserts</option>
                    <option>Drinks</option>
                  </select>
                </div>
              )}
            </div>

            {/* Type selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[
                  { key: 'product', label: 'Product', icon: '🛍️' },
                  { key: 'service', label: 'Service', icon: '💇' },
                  { key: 'menu', label: 'Menu', icon: '🍱' },
                  { key: 'ingredient', label: 'Ingredient', icon: '🧂' },
                ].map(({key,label,icon}) => (
                  <button
                    key={key}
                    type="button"
                    onClick={()=> setProduct(prev=>({ ...prev, itemType: key as any, stock: key==='service' ? Infinity : prev.stock }))}
                    className={`px-2 py-2 rounded-lg text-sm font-medium border transition-colors ${((product as any).itemType||'product')===key ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                    aria-pressed={((product as any).itemType||'product')===key}
                  >
                    <span className="mr-1">{icon}</span>{label}
                  </button>
                ))}
              </div>
              <select value={(product as any).itemType} onChange={(e)=> setProduct(prev=>({ ...prev, itemType: e.target.value as any }))} className="hidden">
                <option value="product">Product</option>
                <option value="service">Service</option>
                <option value="menu">Menu</option>
                <option value="ingredient">Ingredient</option>
              </select>
            </div>

            {/* Pricing + Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput label="Price (₱)" name="price" type="number" value={product.price} onChange={handleChange} required min={0} step={0.01}/>
              <FormInput label="Cost (₱)" name="cost" type="number" value={product.cost} onChange={handleChange} required min={0} step={0.01}/>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Stock</label>
                <div className="mt-1 flex items-center gap-3">
                  {!isUnlimited && (
                    <input
                      id="stock"
                      name="stock"
                      type="number"
                      min={0}
                      value={Number.isFinite(product.stock) ? product.stock : 0}
                      onChange={handleChange}
                      className="block w-full h-11 rounded-lg border-2 border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 px-3"
                    />
                  )}
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={isUnlimited}
                      onChange={(e)=>{
                        const checked = e.target.checked;
                        setProduct(prev => ({ ...prev, stock: checked ? Infinity : (Number.isFinite(prev.stock) ? prev.stock : 0) }));
                      }}
                      disabled={isService}
                      className="h-4 w-4 text-indigo-600 border-slate-300 rounded"
                    />
                    <span>Unlimited{isService ? ' (Service)' : ''}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={product.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-2 border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 p-3"
              />
            </div>

            {/* Commission */}
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
                    min={0}
                    step={0.01}
                    value={product.commissionRate ? (product.commissionRate * 100).toString() : ''}
                    onChange={(e) => handleCommissionRateChange(e.target.value)}
                    placeholder="e.g., 5, 10, 35"
                    className="mt-1 block w-full h-11 rounded-lg border-2 border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 px-3"
                  />
                  <p className="text-xs text-slate-500 mt-1">Percentage of this item's sales paid as commission.</p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white rounded-md border border-slate-300 hover:bg-slate-50 dark:text-slate-300 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Save Item</button>
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
      className="mt-1 block w-full h-11 rounded-lg border-2 border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 px-3"
    />
  </div>
);

export default ProductModal;
