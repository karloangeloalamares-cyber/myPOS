import React, { useEffect, useMemo, useState } from 'react';
import ModuleBackButton from '../../components/ModuleBackButton';
import { supabase } from '@/lib/supabase';
import { listTips, settleTips, TipRecord, TipStatus } from '@/lib/tips';
import { staffService } from '../../services/staffService';
import { storeService } from '../../services/storeService';

type DateRangeOption = 'today' | 'this_week' | 'custom';

const STATUS_TABS: Array<TipStatus | 'all'> = ['all', 'unsettled', 'settled'];

const DATE_DESCRIPTIONS: Record<DateRangeOption, string> = {
  today: 'Today',
  this_week: 'This Week',
  custom: 'Custom range',
};

const getRangeBounds = (option: DateRangeOption, customFrom?: string, customTo?: string) => {
  const now = new Date();
  if (option === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { from: start.toISOString(), to: now.toISOString() };
  }
  if (option === 'this_week') {
    const start = new Date(now);
    const day = start.getDay();
    start.setDate(start.getDate() - day + 1); // Monday
    start.setHours(0, 0, 0, 0);
    return { from: start.toISOString(), to: now.toISOString() };
  }
  return {
    from: customFrom ? new Date(customFrom).toISOString() : undefined,
    to: customTo ? new Date(customTo).toISOString() : undefined,
  };
};

const TipsPage: React.FC = () => {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('myPOS');
  const [tips, setTips] = useState<TipRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TipStatus | 'all'>('all');
  const [rangeOption, setRangeOption] = useState<DateRangeOption>('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [staffFilter, setStaffFilter] = useState('');
  const [selectedTipIds, setSelectedTipIds] = useState<string[]>([]);
  const [staffList, setStaffList] = useState(staffService.getAll());
  const [settling, setSettling] = useState(false);

  useEffect(() => {
    let active = true;

    const loadStoreContext = async () => {
      const hasSupabase =
        Boolean(import.meta.env.VITE_SUPABASE_URL) && Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);

      if (hasSupabase) {
        const result = await supabase
          .from('stores')
          .select('id,name')
          .eq('code', 'DEMO_STORE')
          .maybeSingle();

        if (!active) return;
        if (result.data) {
          setStoreId(result.data.id);
          setStoreName(result.data.name);
          return;
        }
      }

      const stores = await storeService.getAllStores();
      if (!active) return;
      const demoStore = stores.find(s => s.code === 'DEMO_STORE') || stores[0];
      if (demoStore) {
        setStoreId(demoStore.id);
        setStoreName(demoStore.name);
      }
    };

    loadStoreContext();

    return () => {
      active = false;
    };
  }, []);

  const fetchTips = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const bounds = getRangeBounds(rangeOption, customFrom, customTo);
      const data = await listTips({
        storeId,
        status: statusFilter === 'all' ? undefined : statusFilter,
        from: bounds.from,
        to: bounds.to,
        staffId: staffFilter || undefined,
      });
      setTips(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, [storeId, statusFilter, rangeOption, customFrom, customTo, staffFilter]);

  const summary = useMemo(() => {
    const total = tips.reduce((sum, tip) => sum + tip.total_tip, 0);
    const unsettled = tips
      .filter(tip => tip.status === 'unsettled')
      .reduce((sum, tip) => sum + tip.total_tip, 0);
    const settled = total - unsettled;
    const staffMap: Record<string, number> = {};
    tips.forEach(tip => {
      tip.shares.forEach(share => {
        staffMap[share.staff_id] = (staffMap[share.staff_id] || 0) + share.amount;
      });
    });
    const topStaff = Object.entries(staffMap).sort((a, b) => b[1] - a[1])[0];
    const topStaffName = topStaff ? staffList.find(s => s.id === topStaff[0])?.name ?? 'Staff' : '—';
    return {
      total,
      unsettled,
      settled,
      topStaff: `${topStaffName} ₱${(topStaff?.[1] ?? 0).toFixed(2)}`,
    };
  }, [tips, staffList]);

  const toggleTipSelection = (id: string) => {
    setSelectedTipIds(prev => (prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]));
  };

  const unsettledSelected = tips
    .filter(tip => tip.status === 'unsettled')
    .map(tip => tip.id)
    .filter(id => selectedTipIds.includes(id));

  const handleSettle = async () => {
    if (!storeId || unsettledSelected.length === 0) return;
    if (!window.confirm(`Mark ${unsettledSelected.length} tip(s) as settled?`)) return;
    setSettling(true);
    try {
      await settleTips(storeId, unsettledSelected);
      setSelectedTipIds([]);
      await fetchTips();
    } finally {
      setSettling(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 w-full max-w-6xl mx-auto space-y-5">
      <ModuleBackButton />
      <div className="space-y-2">
        <p className="text-xl font-semibold">Tips & Gratuity</p>
        <p className="text-sm text-slate-500">Record and settle shared tips per store.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-1">
          <p className="text-xs text-slate-500">Total tips</p>
          <p className="text-2xl font-bold">₱{summary.total.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-1">
          <p className="text-xs text-slate-500">Unsettled</p>
          <p className="text-2xl font-bold text-amber-600">₱{summary.unsettled.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-1">
          <p className="text-xs text-slate-500">Settled</p>
          <p className="text-2xl font-bold text-emerald-600">₱{summary.settled.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          {STATUS_TABS.map(option => (
            <button
              key={option}
              onClick={() => setStatusFilter(option)}
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                statusFilter === option ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {option === 'all' ? 'All' : option.replace('_', ' ')}
            </button>
          ))}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Date range</span>
            <select
              className="border border-slate-300 rounded px-2 py-1 text-xs"
              value={rangeOption}
              onChange={e => setRangeOption(e.target.value as DateRangeOption)}
            >
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          {rangeOption === 'custom' && (
            <div className="flex gap-2 text-xs">
              <input
                type="date"
                className="border border-slate-300 rounded px-2 py-1"
                value={customFrom}
                onChange={e => setCustomFrom(e.target.value)}
              />
              <input
                type="date"
                className="border border-slate-300 rounded px-2 py-1"
                value={customTo}
                onChange={e => setCustomTo(e.target.value)}
              />
            </div>
          )}
          <select
            className="border border-slate-300 rounded px-2 py-1 text-xs ml-auto"
            value={staffFilter}
            onChange={e => setStaffFilter(e.target.value)}
          >
            <option value="">All staff</option>
            {staffList.map(member => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500">{storeName}</span>
          <button
            type="button"
            className="px-3 py-1 text-xs font-semibold rounded-md bg-emerald-600 text-white disabled:bg-slate-400"
            disabled={unsettledSelected.length === 0 || settling}
            onClick={handleSettle}
          >
            {settling ? 'Settling…' : 'Mark as settled'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-500 tracking-wide">
              <tr>
                <th className="px-2 py-2">
                  <input
                    type="checkbox"
                    checked={selectedTipIds.length === tips.length && tips.length > 0}
                    onChange={e =>
                      setSelectedTipIds(e.target.checked ? tips.map(tip => tip.id) : [])
                    }
                  />
                </th>
                <th className="px-2 py-2">Date</th>
                <th className="px-2 py-2">Sale</th>
                <th className="px-2 py-2">Customer</th>
                <th className="px-2 py-2">Total tip</th>
                <th className="px-2 py-2">Staff</th>
                <th className="px-2 py-2">Method</th>
                <th className="px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-xs text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : tips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-xs text-slate-500">
                    No tips recorded.
                  </td>
                </tr>
              ) : (
                tips.map(tip => (
                  <tr key={tip.id} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={selectedTipIds.includes(tip.id)}
                        onChange={() => toggleTipSelection(tip.id)}
                      />
                    </td>
                    <td className="px-2 py-2 text-xs text-slate-500">
                      {new Date(tip.created_at).toLocaleString()}
                    </td>
                    <td className="px-2 py-2 text-xs font-mono text-slate-600">{tip.sale_id}</td>
                    <td className="px-2 py-2">
                      {tip.customer_id ? 'Linked customer' : 'Walk-in'}
                    </td>
                    <td className="px-2 py-2">₱{tip.total_tip.toFixed(2)}</td>
                    <td className="px-2 py-2 text-xs">
                      {tip.shares.length
                        ? tip.shares
                            .map(share => `${share.staff?.name ?? share.staff_id} ₱${share.amount.toFixed(2)}`)
                            .join(', ')
                        : '—'}
                    </td>
                    <td className="px-2 py-2">{tip.method.toUpperCase()}</td>
                    <td className="px-2 py-2">
                      <span
                        className={`text-[11px] px-2 py-1 rounded-full ${
                          tip.status === 'unsettled'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {tip.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TipsPage;
