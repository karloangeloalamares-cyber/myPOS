import { supabase } from "@/lib/supabase";

export type ModuleName =
  | "pos" | "inventory" | "reports" | "staff"
  | "appointments" | "commissions" | "clients"
  | "tips" | "multi_branch" | "export" | "reminders"
  | "loyalty" | "tickets";

export async function getEnabledModules(storeId: string) {
  const { data, error } = await supabase
    .from("store_modules")
    .select("module_name,is_enabled")
    .eq("store_id", storeId);

  if (error) throw error;
  return Object.fromEntries((data ?? []).map(m => [m.module_name, m.is_enabled])) as Record<ModuleName, boolean>;
}
