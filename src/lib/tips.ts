import { supabase } from '@/lib/supabase';

export type TipMethod = 'cash' | 'card' | 'gcash' | 'other';
export type TipStatus = 'unsettled' | 'settled';

export interface TipShare {
  id: string;
  tip_id: string;
  staff_id: string;
  amount: number;
  created_at: string;
}

export interface TipRecord {
  id: string;
  store_id: string;
  sale_id: string;
  total_tip: number;
  method: TipMethod;
  status: TipStatus;
  settled_at?: string | null;
  created_at: string;
  shares: {
    staff_id: string;
    amount: number;
    staff?: {
      id: string;
      name: string;
    };
  }[];
}

export interface RecordTipParams {
  storeId: string;
  saleId: string;
  totalTip: number;
  method: TipMethod;
  allocations: { staffId: string; amount: number }[];
}

const SUPABASE_ENABLED =
  Boolean(import.meta.env.VITE_SUPABASE_URL) && Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);

const LOCAL_TIPS_KEY = (storeId: string) => `local_tips_${storeId}`;

export function readLocalTips(storeId: string): TipRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const payload = window.localStorage.getItem(LOCAL_TIPS_KEY(storeId));
    if (!payload) return [];
    return JSON.parse(payload) as TipRecord[];
  } catch {
    return [];
  }
}

export function writeLocalTips(storeId: string, tips: TipRecord[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_TIPS_KEY(storeId), JSON.stringify(tips));
}

async function ensureStoreContext(storeId: string) {
  if (!SUPABASE_ENABLED) return;
  // argument name must match the SQL function definition
  await supabase.rpc('set_current_store_context', { p_store_id: storeId });
}

function buildLocalTipRecord(params: RecordTipParams, overrides?: Partial<TipRecord>): TipRecord {
  const now = new Date().toISOString();
  const nextId =
    overrides?.id ??
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? (crypto as typeof globalThis.crypto).randomUUID()
      : `tip_${Date.now()}`);
  const shares = (params.allocations ?? []).map(share => ({
    staff_id: share.staffId,
    amount: share.amount,
  }));
  return {
    id: nextId,
    store_id: params.storeId,
    sale_id: params.saleId,
    total_tip: params.totalTip,
    method: params.method,
    status: 'unsettled',
    settled_at: overrides?.settled_at ?? null,
    created_at: overrides?.created_at ?? now,
    shares,
    ...overrides,
  };
}

export async function recordTipForSale(params: RecordTipParams) {
  if (params.allocations?.length) {
    if (params.allocations.reduce((sum, share) => sum + share.amount, 0) !== params.totalTip) {
      throw new Error('Allocations must sum to total tip.');
    }
  }

  const storeLocally = () => {
    const localTip = buildLocalTipRecord(params);
    const existing = readLocalTips(params.storeId);
    writeLocalTips(params.storeId, [localTip, ...existing]);
    return localTip.id;
  };

  if (!SUPABASE_ENABLED) {
    return storeLocally();
  }

  try {
    await ensureStoreContext(params.storeId);

    const { data, error } = await supabase
      .from('tips')
      .insert({
        store_id: params.storeId,
        sale_id: params.saleId,
        total_tip: params.totalTip,
        method: params.method,
        status: 'unsettled',
      })
      .select('id')
      .single();

    if (error || !data) throw error ?? new Error('Failed to insert tip');
    const tipId = (data as { id: string }).id;

    const shares = (params.allocations ?? []).map(share => ({
      tip_id: tipId,
      staff_id: share.staffId,
      amount: share.amount,
    }));

    const { error: shareError } = await supabase.from('tip_shares').insert(shares);
    if (shareError) throw shareError;
    return tipId;
  } catch (err) {
    console.warn('recordTipForSale falling back to local tips storage', err);
    return storeLocally();
  }
}

interface ListTipsOptions {
  storeId: string;
  from?: string;
  to?: string;
  staffId?: string;
  status?: TipStatus;
}

function filterLocalTips(tips: TipRecord[], options: ListTipsOptions) {
  const fromDate = options.from ? new Date(options.from).getTime() : undefined;
  const toDate = options.to ? new Date(options.to).getTime() : undefined;
  return [...tips]
    .filter(tip => {
      if (options.status && tip.status !== options.status) return false;
      if (options.staffId) {
        const hasStaff = tip.shares.some(share => share.staff_id === options.staffId);
        if (!hasStaff) return false;
      }
      const created = new Date(tip.created_at).getTime();
      if (fromDate !== undefined && created < fromDate) return false;
      if (toDate !== undefined && created > toDate) return false;
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function listTips(options: ListTipsOptions) {
  const localFallback = () => filterLocalTips(readLocalTips(options.storeId), options);

  if (!SUPABASE_ENABLED) {
    return localFallback();
  }

  await ensureStoreContext(options.storeId);

  let query = supabase
    .from('tips')
    .select(
      `
      id,
      store_id,
      sale_id,
      total_tip,
      method,
      status,
      settled_at,
      created_at,
      shares:tip_shares(
        staff_id,
        amount
      )
    `
    )
    .eq('store_id', options.storeId)
    .order('created_at', { ascending: false });

  if (options.status) query = query.eq('status', options.status);
  if (options.from) query = query.gte('created_at', options.from);
  if (options.to) query = query.lte('created_at', options.to);

  try {
    const { data, error } = await query;
    if (error) throw error;

    if (!data || data.length === 0) {
      return localFallback();
    }

    let tips = ((data ?? []) as TipRecord[]).map(tip => ({
      ...tip,
      shares: tip.shares ?? [],
    }));

    if (options.staffId) {
      tips = tips.filter(tip => tip.shares.some(share => share.staff_id === options.staffId));
    }

    return tips;
  } catch (err) {
    console.warn('listTips failed, using local tips data instead', err);
    return localFallback();
  }
}

export async function settleTips(storeId: string, tipIds: string[]) {
  const settleLocally = () => {
    const tips = readLocalTips(storeId);
    const now = new Date().toISOString();
    const settled = tips.map(tip => {
      if (tipIds.includes(tip.id) && tip.status === 'unsettled') {
        return { ...tip, status: 'settled', settled_at: now };
      }
      return tip;
    });
    writeLocalTips(storeId, settled);
    return true;
  };

  if (!SUPABASE_ENABLED) {
    return settleLocally();
  }

  await ensureStoreContext(storeId);

  try {
    const { error } = await supabase
      .from('tips')
      .update({ status: 'settled' as TipStatus, settled_at: new Date().toISOString() })
      .in('id', tipIds)
      .eq('store_id', storeId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('settleTips failed, updating local tips instead', err);
    return settleLocally();
  }
}
