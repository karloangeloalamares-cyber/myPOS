import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const ALL_MODULES: { key: string; label: string }[] = [
  { key: "pos", label: "POS" },
  { key: "inventory", label: "Inventory" },
  { key: "reports", label: "Sales Reports" },
  { key: "staff", label: "Staff" },
  { key: "appointments", label: "Appointments" },
  { key: "commissions", label: "Commissions" },
  { key: "clients", label: "Client Profiles" },
  { key: "tips", label: "Tips" },
  { key: "multi_branch", label: "Multi-Branch" },
  { key: "export", label: "Export (CSV/PDF)" },
  { key: "reminders", label: "Reminders (SMS/Email)" },
  { key: "loyalty", label: "Loyalty (Punch Card)" },
];

type Row = { module_name: string; is_enabled: boolean };

export default function StoreModulesAdmin({ storeId: initialStoreId }: { storeId?: string }) {
  const [storeId, setStoreId] = useState<string>(initialStoreId || "");
  const [plan, setPlan] = useState<"Free"|"Premium">("Free");
  const [rows, setRows] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (initialStoreId) setStoreId(initialStoreId); }, [initialStoreId]);

  async function load() {
    if (!storeId) return;
    setLoading(true);
    const [{ data: s }, { data: mods }] = await Promise.all([
      supabase.from("stores").select("store_plan").eq("id", storeId).maybeSingle(),
      supabase.from("store_modules").select("module_name,is_enabled").eq("store_id", storeId)
    ]);
    if (s) setPlan((s.store_plan as "Free"|"Premium") ?? "Free");
    const map: Record<string, boolean> = {};
    (mods ?? []).forEach((m: Row) => (map[m.module_name] = m.is_enabled));
    setRows(map);
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [storeId]);

  async function savePlan(p: "Free"|"Premium") {
    setPlan(p);
    await supabase.from("stores").update({ store_plan: p }).eq("id", storeId);
    await load(); // reseeded by trigger
  }

  async function toggle(key: string, value: boolean) {
    setRows(prev => ({ ...prev, [key]: value }));
    await supabase.from("store_modules")
      .upsert({ store_id: storeId, module_name: key, is_enabled: value }, { onConflict: "store_id,module_name" });
  }

  const sorted = useMemo(
    () => ALL_MODULES.map(m => ({ ...m, enabled: !!rows[m.key] })),
    [rows]
  );

  if (!storeId) return <div className="p-4">Set storeId in code or via a selector.</div>;
  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Store Modules</h1>

      <div className="flex items-center gap-2">
        <span className="text-sm opacity-70">Plan:</span>
        <button
          className={`px-3 py-1 rounded ${plan==='Free'?'bg-black text-white':'border'}`}
          onClick={() => savePlan('Free')}
        >Free</button>
        <button
          className={`px-3 py-1 rounded ${plan==='Premium'?'bg-black text-white':'border'}`}
          onClick={() => savePlan('Premium')}
        >Premium</button>
      </div>

      <div className="grid md:grid-cols-3 gap-2">
        {sorted.map(m => (
          <label key={m.key} className="flex items-center gap-2 border rounded p-2">
            <input
              type="checkbox"
              checked={m.enabled}
              onChange={e => toggle(m.key, e.target.checked)}
            />
            <span>{m.label}</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded border">{m.key}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

