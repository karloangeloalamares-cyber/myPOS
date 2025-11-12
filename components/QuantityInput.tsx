import React from 'react';

interface QuantityInputProps {
  value: number;
  stock: number;
  onChange: (newValue: number) => void;
}

const QuantityInput: React.FC<QuantityInputProps> = ({ value, stock, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num)) {
      onChange(num);
    } else if (e.target.value === '') {
      // Allow user to clear the input before typing a new number
      // We'll handle empty state onBlur
      onChange(0); // Temporarily set to 0 or another placeholder
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '' || value <= 0) {
      onChange(1); // Reset to 1 if left empty or invalid
    }
  };

  return (
    <div className="flex items-center w-full">
      <button 
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        className="w-7 h-7 flex items-center justify-center rounded-l-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 font-bold disabled:opacity-50 flex-shrink-0"
        aria-label="Decrease quantity"
      >
        -
      </button>
      <input
        type="number"
        value={value === 0 ? '' : value}
        onChange={handleChange}
        onBlur={handleBlur}
        className="flex-1 min-w-0 h-7 text-center border-y border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        min="1"
        max={stock === Infinity ? undefined : stock}
        aria-label="Item quantity"
      />
      <button 
        onClick={() => onChange(value + 1)}
        disabled={value >= stock}
        className="w-7 h-7 flex items-center justify-center rounded-r-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 font-bold disabled:opacity-50 flex-shrink-0"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
};

export default QuantityInput;