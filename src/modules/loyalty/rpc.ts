import { supabase } from "@/lib/supabase";

export async function earnVisit(orderId: string) {
  const { error } = await supabase.rpc("earn_visit", { p_order_id: orderId });
  if (error) throw error;
}

export async function redeemVisit(storeId: string, customerId: string, orderId: string) {
  const { data, error } = await supabase.rpc("redeem_visit", {
    p_store_id: storeId,
    p_customer_id: customerId,
    p_order_id: orderId
  });
  if (error) throw error;
  return data as boolean;
}

export async function getLoyaltySummary(storeId: string, customerId: string) {
  const { data, error } = await supabase
    .from("loyalty_visit_summary")
    .select("*")
    .eq("store_id", storeId)
    .eq("customer_id", customerId)
    .maybeSingle();
  if (error) throw error;
  return data as {
    store_id: string;
    customer_id: string;
    full_name: string | null;
    visit_count: number;
    visits_required: number;
    progress_in_cycle: number;
  } | null;
}

