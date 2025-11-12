import React, { useEffect, useState } from "react";
import { getEnabledModules } from "@/modules/access";

export default function AppMenu({ storeId }: { storeId: string }) {
  const [mods, setMods] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!storeId) return;
    getEnabledModules(storeId).then(setMods).catch(console.error);
  }, [storeId]);

  const show = (m: string) => !!mods[m];

  return (
    <nav className="flex gap-3 p-2 border-b">
      {show("pos") && <a href="#/pos">POS</a>}
      {show("inventory") && <a href="#/inventory">Inventory</a>}
      {show("reports") && <a href="#/reports">Reports</a>}
      {show("staff") && <a href="#/staff">Staff</a>}
      {show("appointments") && <a href="#/appointments">Appointments</a>}
      {show("commissions") && <a href="#/commissions">Commissions</a>}
      {show("clients") && <a href="#/clients">Clients</a>}
      {show("tips") && <a href="#/tips">Tips</a>}
      {show("loyalty") && <a href="#/loyalty">Loyalty</a>}
      {show("export") && <a href="#/export">Export</a>}
      {show("reminders") && <a href="#/reminders">Reminders</a>}
      {show("multi_branch") && <a href="#/multi-branch">Locations</a>}
    </nav>
  );
}

