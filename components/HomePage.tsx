import React from 'react';
import {
  TerminalIcon,
  BoxIcon,
  ChartBarIcon,
  CogIcon,
  CalendarIcon,
  TicketIcon,
  UsersIcon,
  DollarIcon,
  DownloadIcon,
  BellIcon,
  GlobeIcon,
  ReceiptIcon,
  TagIcon,
} from './icons';
import type { FeatureFlags } from '../types';
import type { ModuleMap } from '@/services/moduleService';

interface HomePageProps {
  storeName: string;
  modules?: ModuleMap;
  features?: FeatureFlags;
}

interface CardConfig {
  key: string;
  label: string;
  description: string;
  href: string;
  icon: React.ReactElement;
}

const HomeCard: React.FC<Omit<CardConfig, 'key'>> = ({ label, icon, href, description }) => {
  return (
    <a
      href={href}
      className="group block bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left"
    >
      <div className="flex items-center space-x-4">
        <div className="bg-indigo-100 dark:bg-indigo-500/20 p-3 rounded-full">
          {React.cloneElement(icon, { className: 'h-8 w-8 text-indigo-600 dark:text-indigo-400' })}
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{label}</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        </div>
      </div>
    </a>
  );
};

const CORE_CARDS: CardConfig[] = [
  {
    key: 'pos',
    label: 'POS Terminal',
    description: 'Process sales and manage orders.',
    href: '#/pos',
    icon: <TerminalIcon />,
  },
  {
    key: 'inventory',
    label: 'Menu & Inventory',
    description: 'Manage your products and stock levels.',
    href: '#/inventory',
    icon: <BoxIcon />,
  },
  {
    key: 'reports',
    label: 'Sales Reports',
    description: 'View sales data and analytics.',
    href: '#/reports',
    icon: <ChartBarIcon />,
  },
  {
    key: 'settings',
    label: 'Store Settings',
    description: 'Configure your store and tax settings.',
    href: '#/settings',
    icon: <CogIcon />,
  },
];

const OPTIONAL_MODULE_CARDS: CardConfig[] = [
  {
    key: 'appointments',
    label: 'Appointments',
    description: 'Manage bookings and staff schedules.',
    href: '#/appointments',
    icon: <CalendarIcon />,
  },
  {
    key: 'tickets',
    label: 'Tickets & Queue',
    description: 'Track service tickets or laundry loads.',
    href: '#/tickets',
    icon: <TicketIcon />,
  },
  {
    key: 'clients',
    label: 'Clients & CRM',
    description: 'Maintain client profiles and history.',
    href: '#/clients',
    icon: <UsersIcon />,
  },
  {
    key: 'tips',
    label: 'Tips & Gratuity',
    description: 'Record and settle shared tips.',
    href: '#/tips',
    icon: <DollarIcon />,
  },
  {
    key: 'commissions',
    label: 'Commissions',
    description: 'Track payouts per staff member.',
    href: '#/commissions',
    icon: <ReceiptIcon />,
  },
  {
    key: 'export',
    label: 'Data Export',
    description: 'Download sales and inventory data.',
    href: '#/export',
    icon: <DownloadIcon />,
  },
  {
    key: 'reminders',
    label: 'Reminders',
    description: 'Automate follow-ups and alerts.',
    href: '#/reminders',
    icon: <BellIcon />,
  },
  {
    key: 'multi_branch',
    label: 'Multi-Branch',
    description: 'Monitor and manage other branches.',
    href: '#/multi-branch',
    icon: <GlobeIcon />,
  },
  {
    key: 'loyalty',
    label: 'Loyalty',
    description: 'Reward and retain loyal customers.',
    href: '#/clients',
    icon: <TagIcon />,
  },
];

const featureBridge: Record<string, keyof FeatureFlags> = {
  appointments: 'enableAppointments',
  tickets: 'enableTickets',
};

const HomePage: React.FC<HomePageProps> = ({ storeName, modules, features }) => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
  const showAdminShortcut = isLocal && role === 'super_admin';

  const isModuleEnabled = (key: string) => {
    const moduleFlag = modules ? Boolean((modules as Record<string, boolean>)[key]) : false;
    if (moduleFlag) return true;
    const featureKey = featureBridge[key];
    return featureKey ? Boolean(features?.[featureKey]) : false;
  };

  const dynamicCards = OPTIONAL_MODULE_CARDS.filter(card => isModuleEnabled(card.key));
  const cardsToRender = [...CORE_CARDS, ...dynamicCards];

  return (
    <div className="text-center">
      <h2 className="text-4xl font-extrabold text-slate-800 dark:text-slate-200">Welcome to {storeName}</h2>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Select an option to get started.</p>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {cardsToRender.map(card => (
          <HomeCard key={card.key} {...card} />
        ))}

        {showAdminShortcut && (
          <HomeCard
            key="admin"
            label="Super Admin"
            icon={<ChartBarIcon />}
            href="#/admin"
            description="(dev) Create and manage stores - visible on localhost only."
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
