import React from 'react';
import { TerminalIcon, BoxIcon, ChartBarIcon, CogIcon } from './icons';

interface NavigationProps {
  currentPath: string;
  modules?: Partial<Record<string, boolean>>;
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

const Navigation: React.FC<NavigationProps> = ({ currentPath, modules = {} }) => {
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
          {modules['appointments'] && (
            <NavLink label="Appointments" icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M4 11h16M5 19h14a2 2 0 002-2v-8H3v8a2 2 0 002 2z"/></svg>} isActive={currentPath === '#/appointments'} href="#/appointments" />
          )}
          {modules['commissions'] && (
            <NavLink label="Commissions" icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 11V3a1 1 0 012 0v8h8a1 1 0 010 2h-8v8a1 1 0 01-2 0v-8H3a1 1 0 110-2h8z"/></svg>} isActive={currentPath === '#/commissions'} href="#/commissions" />
          )}
          {modules['clients'] && (
            <NavLink label="Clients" icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-6a4 4 0 11-8 0 4 4 0 018 0m10 0a4 4 0 11-8 0 4 4 0 018 0"/></svg>} isActive={currentPath === '#/clients'} href="#/clients" />
          )}
          {modules['tips'] && (
            <NavLink label="Tips" icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-7 8h8a2 2 0 002-2v-3a7 7 0 10-12 0v3a2 2 0 002 2z"/></svg>} isActive={currentPath === '#/tips'} href="#/tips" />
          )}
          {modules['export'] && (
            <NavLink label="Export" icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16h16M12 8v8m0 0l-3-3m3 3l3-3"/></svg>} isActive={currentPath === '#/export'} href="#/export" />
          )}
          {modules['reminders'] && (
            <NavLink label="Reminders" icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>} isActive={currentPath === '#/reminders'} href="#/reminders" />
          )}
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
