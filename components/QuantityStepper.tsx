import React from 'react';

interface QuantityStepperProps {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onIncrease,
  onDecrease,
  min = 1,
}) => {
  const isAtMin = value <= min;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <button
        type="button"
        onClick={onDecrease}
        disabled={isAtMin}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-2xl font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-40 disabled:hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-900"
        aria-label="Decrease quantity"
      >
        −
      </button>

      <div className="min-w-[2.5rem] px-3 text-center text-sm font-semibold text-slate-800 dark:text-white">
        {value}
      </div>

      <button
        type="button"
        onClick={onIncrease}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-indigo-600 text-lg font-bold text-white transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
};
