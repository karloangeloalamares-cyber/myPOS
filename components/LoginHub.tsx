import React from 'react';

const LoginHub: React.FC = () => {
  return (
    <div className="max-w-xl w-full mx-auto bg-white dark:bg-slate-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">Welcome to myPOS</h2>
      <p className="text-sm mb-6 text-slate-500 dark:text-slate-400">Choose how you want to sign in.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="#/login-store" className="block p-4 rounded-md border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:shadow transition">
          <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">Owner Login</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Access POS, inventory and reports.</div>
        </a>
        <a href="#/login-admin" className="block p-4 rounded-md border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:shadow transition">
          <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">Super Admin</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Manage customer stores and tenants.</div>
        </a>
      </div>
    </div>
  );
};

export default LoginHub;
