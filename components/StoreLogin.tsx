import React, { useEffect, useMemo, useState } from 'react';
import { Store } from '../types';
import { loginStoreUser, listTestUsersForStore, seedTestUsersForStore, quickLoginTestUser, DEFAULT_STORE_OWNER_PASSWORD } from '../services/localAuth';
import { storeService } from '../services/storeService';

interface StoreLoginProps {
  stores?: Store[]; // optional; if omitted we fetch from storeService
  onSuccess?: (storeId: string) => void;
}

const DEMO_STORE_CODE = 'DEMO_STORE';
const DEMO_OWNER_EMAIL = 'owner@mypos.local';

const StoreLogin: React.FC<StoreLoginProps> = ({ stores: storesProp, onSuccess }) => {
  const [stores, setStores] = useState<Store[]>(storesProp || []);
  const [storeId, setStoreId] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testUsers, setTestUsers] = useState<ReturnType<typeof listTestUsersForStore>>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (storesProp && storesProp.length) {
        // Ensure we set an initial storeId when stores are provided
        if (!storeId) setStoreId(storesProp[0].id);
        return;
      }
      try {
        const list = await storeService.getAllStores();
        if (mounted) {
          setStores(list);
          if (!storeId && list.length > 0) setStoreId(list[0].id);
        }
      } catch (e) {
        // ignore
      }
    };
    load();
    return () => { mounted = false; };
  }, [storesProp]);

  useEffect(() => {
    const sid = storeId || (stores[0]?.id || '');
    if (!sid) return;
    let users = listTestUsersForStore(sid);
    const currentStore = stores.find(s => s.id === sid);
    if (!users || users.length === 0) {
      if (currentStore) {
        users = seedTestUsersForStore(currentStore);
      }
    }
    setTestUsers(users || []);
    // Autofill the email field with the manager's test email when available
    if (users && users.length > 0) {
      const manager = users.find(u => u.role === 'store_manager');
      setEmail(prev => prev || (manager || users[0]).email);
    } else if (currentStore) {
      const fallbackEmail = currentStore.contactEmail || currentStore.email;
      if (fallbackEmail) {
        setEmail(prev => prev || fallbackEmail);
      }
    }
    setPassword(prev => {
      if (currentStore?.code === DEMO_STORE_CODE) {
        return prev || DEFAULT_STORE_OWNER_PASSWORD;
      }
      return prev ? '' : prev;
    });
  }, [storeId, stores]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const sid = storeId || (stores[0]?.id || '');
      const user = await loginStoreUser({ storeId: sid, email, password });
      if (onSuccess) onSuccess(user.storeId || sid);
      else window.location.hash = '#/';
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white dark:bg-slate-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">Store Login</h2>
      <p className="text-sm mb-6 text-slate-500 dark:text-slate-400">Sign in to manage your store or branches.</p>
      {error && (
        <div className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Store</label>
          <select
            className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            value={storeId}
            onChange={(e) => {
              const sid = e.target.value;
              setStoreId(sid);
              // Immediately fill email for the selected store
              try {
                let users = listTestUsersForStore(sid);
                if (!users || users.length === 0) {
                  const store = stores.find(s => s.id === sid);
                  if (store) users = seedTestUsersForStore(store);
                }
                if (users && users.length > 0) {
                  const manager = users.find(u => u.role === 'store_manager');
                  setEmail((manager || users[0]).email);
                } else {
                  const targetStore = stores.find(s => s.id === sid);
                  const fallbackEmail = targetStore?.contactEmail || targetStore?.email || '';
                  setEmail(fallbackEmail);
                }
                const targetStore = stores.find(s => s.id === sid);
                if (targetStore?.code === DEMO_STORE_CODE) {
                  setPassword(DEFAULT_STORE_OWNER_PASSWORD);
                } else {
                  setPassword('');
                }
              } catch {}
            }}
          >
            <option value="" disabled={stores.length > 0}>Select a store</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || stores.length === 0}
          className="w-full py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      {stores.some(s => s.code === DEMO_STORE_CODE) && (
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          Demo store credentials: <span className="font-semibold">{DEMO_OWNER_EMAIL}</span> / <span className="font-semibold">{DEFAULT_STORE_OWNER_PASSWORD}</span>
        </p>
      )}
      {stores.length > 0 && (
        <div className="mt-6">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Test Logins</div>
          <div className="flex flex-col gap-2">
            {testUsers && testUsers.map(u => (
              <button
                key={u.email}
                onClick={async (ev) => {
                  ev.preventDefault();
                  setError(null);
                  setLoading(true);
                  try {
                    await quickLoginTestUser(u);
                    if (onSuccess) onSuccess(u.storeId);
                    else window.location.hash = '#/';
                  } catch (err: any) {
                    setError(err?.message || 'Login failed');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-100"
              >
                Login as {u.role.replace('_', ' ')} ({u.email})
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">Passwords: manager123, cashier123</p>
        </div>
      )}
      <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        Super admin? <a className="text-indigo-600" href="#/login-admin">Go to Super Admin Login</a>
      </div>
    </div>
  );
};

export default StoreLogin;
