
import React, { useState } from 'react';
import { SettingsData } from '../types';

interface SettingsProps {
  settings: SettingsData;
  onSave: (newSettings: SettingsData) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<SettingsData>(settings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'taxRate' || name === 'lowStockThreshold' 
                ? (isNaN(numValue) ? '' : numValue) 
                : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
        ...formData,
        taxRate: Number(formData.taxRate) || 0,
        lowStockThreshold: Number(formData.lowStockThreshold) || 0,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => { window.history.back(); }}
          className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600"
          aria-label="Back to Main Menu"
        >
          ← Back
        </button>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-6">Store Settings</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 sm:p-8 space-y-6">
        <FormInput 
          label="Store Name" 
          name="storeName" 
          value={formData.storeName} 
          onChange={handleChange}
          required 
        />
        <FormInput 
          label="Store Address" 
          name="storeAddress" 
          value={formData.storeAddress} 
          onChange={handleChange}
        />
        <FormInput 
          label="Contact Info (Email or Phone)" 
          name="contactInfo" 
          value={formData.contactInfo} 
          onChange={handleChange}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput 
              label="Tax Rate (%)" 
              name="taxRate" 
              type="number" 
              value={formData.taxRate} 
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
            <FormInput 
              label="Low Stock Threshold" 
              name="lowStockThreshold" 
              type="number" 
              value={formData.lowStockThreshold} 
              onChange={handleChange}
              required
              min="0"
              step="1"
            />
        </div>
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Settings
          </button>
        </div>
      </form>
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

export default Settings;
