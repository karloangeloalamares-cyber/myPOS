import supabase from '@/lib/supabase';
import type { ModuleName } from '@/modules/access';

export type ModuleMap = Record<ModuleName, boolean>;

const ALL_MODULES: ModuleName[] = [
  'pos','inventory','reports','staff',
  'appointments','commissions','clients','tips',
  'multi_branch','export','reminders','loyalty','tickets'
];

export const FREE_PLAN: ModuleMap = {
  pos: true,
  inventory: true,
  staff: true,
  reports: true,
  appointments: false,
  commissions: false,
  clients: false,
  tips: false,
  multi_branch: false,
  export: false,
  reminders: false,
  loyalty: false,
  tickets: false,
};

export const PREMIUM_PLAN: ModuleMap = {
  ...FREE_PLAN,
  appointments: true,
  commissions: true,
  clients: true,
  tips: true,
  multi_branch: true,
  export: true,
  reminders: true,
  tickets: true,
};

function hasSupabaseEnv() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

function localKey(storeId: string) {
  return `store_modules_${storeId}`;
}

export async function getModules(storeId: string): Promise<ModuleMap> {
  try {
    if (hasSupabaseEnv()) {
      const { data, error } = await supabase
        .from('store_modules')
        .select('module_name,is_enabled')
        .eq('store_id', storeId);
      if (error) throw error;
      const map: ModuleMap = { ...FREE_PLAN };
      (data || []).forEach(row => {
        map[row.module_name as ModuleName] = !!row.is_enabled;
      });
      return map;
    }
  } catch (e) {
    console.warn('Falling back to local module map', e);
  }
  // Fallback: localStorage
  const raw = localStorage.getItem(localKey(storeId));
  return raw ? JSON.parse(raw) as ModuleMap : { ...FREE_PLAN };
}

export async function setModule(storeId: string, moduleName: ModuleName, enabled: boolean) {
  try {
    if (hasSupabaseEnv()) {
      const { error } = await supabase
        .from('store_modules')
        .upsert({ store_id: storeId, module_name: moduleName, is_enabled: enabled }, { onConflict: 'store_id,module_name' });
      if (error) throw error;
      return;
    }
  } catch (e) {
    console.warn('Supabase module update failed; using localStorage', e);
  }
  const existing = await getModules(storeId);
  existing[moduleName] = enabled;
  localStorage.setItem(localKey(storeId), JSON.stringify(existing));
}

export async function seedForPlan(storeId: string, plan: 'free' | 'premium') {
  const base = plan === 'premium' ? PREMIUM_PLAN : FREE_PLAN;
  try {
    if (hasSupabaseEnv()) {
      const rows = ALL_MODULES.map((m) => ({ store_id: storeId, module_name: m, is_enabled: !!base[m] }));
      const { error } = await supabase.from('store_modules').upsert(rows, { onConflict: 'store_id,module_name' });
      if (error) throw error;
      return;
    }
  } catch (e) {
    console.warn('Supabase seed failed; using localStorage', e);
  }
  localStorage.setItem(localKey(storeId), JSON.stringify(base));
}


