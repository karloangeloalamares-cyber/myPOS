import React from 'react';
import { ShopIcon, SunIcon, MoonIcon } from './icons';
// FIX: Import Theme from types.ts instead of App.tsx
import { Theme, User } from '../types';

interface HeaderProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    storeName: string;
    stores?: { id: string; name: string }[];
    currentStoreId?: string | null;
    onStoreChange?: (storeId: string) => void;
    currentUser?: User | null;
    onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme, storeName, stores, currentStoreId, onStoreChange, currentUser, onLogout }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
        <a href="#/" className="flex items-center space-x-3">
          <ShopIcon className="h-8 w-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            {storeName}
          </h1>
        </a>
        <div className="flex items-center space-x-4">
            <span className="hidden sm:inline text-sm font-medium text-slate-500 dark:text-slate-400">myPOS</span>
            {stores && onStoreChange && stores.length > 1 && (
              <select
                className="ml-3 bg-transparent border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm rounded-md px-2 py-1"
                value={currentStoreId || ''}
                onChange={e => onStoreChange(e.target.value)}
              >
                {stores.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                  {currentUser.role === 'super_admin' ? 'Super Admin' : 'Store User'}
                </span>
                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 text-sm font-medium rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 text-sm">
                <a href="#/login-store" className="px-3 py-1.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600">Owner Login</a>
                <a href="#/login-admin" className="px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Super Admin</a>
              </div>
            )}
            <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Toggle theme"
            >
            {theme === 'light' ? (
                <MoonIcon className="h-6 w-6" />
            ) : (
                <SunIcon className="h-6 w-6" />
            )}
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
