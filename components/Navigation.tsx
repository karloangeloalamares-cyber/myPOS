import React from 'react';
import { TerminalIcon, BoxIcon, ChartBarIcon, CogIcon } from './icons';

interface NavigationProps {
  currentPath: string;
}

const NavLink: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  href: string;
}> = ({ label, icon, isActive, href }) => {
  const activeClasses = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400';
  const inactiveClasses = 'text-slate-600 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200';
  
  return (
    <a
      href={href}
      className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
};

const Navigation: React.FC<NavigationProps> = ({ currentPath }) => {
  // Check if user is super admin using persisted role from local auth
  const userRole = localStorage.getItem('userRole') || 'cashier';
  const isSuperAdmin = userRole === 'super_admin';

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center space-x-2 py-2">
          {isSuperAdmin && (
            <NavLink
              label="Admin"
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              }
              isActive={currentPath === '#/admin'}
              href="#/admin"
            />
          )}
          <NavLink
            label="POS"
            icon={<TerminalIcon className="h-5 w-5" />}
            isActive={currentPath === '#/pos'}
            href="#/pos"
          />
          <NavLink
            label="Inventory"
            icon={<BoxIcon className="h-5 w-5" />}
            isActive={currentPath === '#/inventory'}
            href="#/inventory"
          />
          <NavLink
            label="Reports"
            icon={<ChartBarIcon className="h-5 w-5" />}
            isActive={currentPath === '#/reports'}
            href="#/reports"
          />
          <NavLink
            label="Settings"
            icon={<CogIcon className="h-5 w-5" />}
            isActive={currentPath === '#/settings'}
            href="#/settings"
          />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
