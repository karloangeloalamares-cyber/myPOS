import React from 'react';
import { TerminalIcon, BoxIcon, ChartBarIcon, CogIcon } from './icons';

interface HomePageProps {
    storeName: string;
}

const HomeCard: React.FC<{ label: string; icon: React.ReactNode; href: string; description: string }> = ({ label, icon, href, description }) => {
    return (
        <a href={href} className="group block bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left">
            <div className="flex items-center space-x-4">
                <div className="bg-indigo-100 dark:bg-indigo-500/20 p-3 rounded-full">
                    {React.cloneElement(icon as React.ReactElement, { className: "h-8 w-8 text-indigo-600 dark:text-indigo-400" })}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{label}</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{description}</p>
                </div>
            </div>
        </a>
    );
};


const HomePage: React.FC<HomePageProps> = ({ storeName }) => {
  // Show a small dev-only link to the Super Admin panel when running locally
  // and only when the current user is a super admin.
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
  const showAdminShortcut = isLocal && role === 'super_admin';

  return (
    <div className="text-center">
        <h2 className="text-4xl font-extrabold text-slate-800 dark:text-slate-200">Welcome to {storeName}</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Select an option to get started.</p>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <HomeCard 
                label="POS Terminal" 
                icon={<TerminalIcon />} 
                href="#/pos"
                description="Process sales and manage orders."
            />
            <HomeCard 
                label="Menu & Inventory" 
                icon={<BoxIcon />} 
                href="#/inventory"
                description="Manage your products and stock levels."
            />
            <HomeCard 
                label="Sales Reports" 
                icon={<ChartBarIcon />} 
                href="#/reports"
                description="View sales data and analytics."
            />
            <HomeCard 
                label="Store Settings" 
                icon={<CogIcon />} 
                href="#/settings"
                description="Configure your store and tax settings."
            />

            {showAdminShortcut && (
                <HomeCard
                    label="Super Admin"
                    icon={<ChartBarIcon />}
                    href="#/admin"
                    description="(dev) Create and manage stores • visible on localhost only."
                />
            )}
        </div>
    </div>
  );
};

export default HomePage;
