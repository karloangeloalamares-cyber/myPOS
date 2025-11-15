import React from 'react';
import { ArrowLeftIcon } from './icons';

interface ModuleBackButtonProps {
  label?: string;
  href?: string;
}

const ModuleBackButton: React.FC<ModuleBackButtonProps> = ({
  label = 'Back to Dashboard',
  href = '#/',
}) => {
  const handleClick = () => {
    if (href) {
      window.location.hash = href.startsWith('#') ? href : `#${href}`;
      return;
    }
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.hash = '#/';
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
    >
      <ArrowLeftIcon className="w-4 h-4" />
      {label}
    </button>
  );
};

export default ModuleBackButton;
