import React, { useEffect, useState } from "react";
import { getLoyaltySummary, redeemVisit } from "@/modules/loyalty/rpc";

type Props = {
  storeId: string;
  customerId: string;
  orderId: string;
  enabled: boolean; // feature gate from store_modules
};

export default function LoyaltyPunchCard({ storeId, customerId, orderId, enabled }: Props) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getLoyaltySummary>>>(null);
  const canRedeem = !!summary && summary.visit_count >= summary.visits_required;

  useEffect(() => {
    if (!enabled || !customerId) return;
    setLoading(true);
    getLoyaltySummary(storeId, customerId).then(setSummary).finally(() => setLoading(false));
  }, [storeId, customerId, enabled]);

  if (!enabled) return null;
  if (loading) return <div className="text-sm opacity-70">Loading loyalty…</div>;
  if (!summary) return <div className="text-sm opacity-70">No loyalty data.</div>;

  return (
    <div className="border rounded-lg p-3">
      <div className="font-medium">Loyalty (Punch Card)</div>
      <div className="text-sm">
        Visits: <b>{summary.visit_count}</b> / {summary.visits_required}
        {" · "}Progress this cycle: <b>{summary.progress_in_cycle}</b>
      </div>
      <button
        className="mt-2 px-3 py-2 rounded bg-black text-white disabled:opacity-40"
        disabled={!canRedeem}
        onClick={async () => {
          const ok = await redeemVisit(storeId, customerId, orderId);
          if (ok) {
            alert("Reward redeemed. Apply discount/free item now.");
            const updated = await getLoyaltySummary(storeId, customerId);
            setSummary(updated);
          } else {
            alert("Not eligible yet.");
          }
        }}
      >
        Redeem Reward
      </button>
    </div>
  );
}

