export type PlanKey = "starter" | "pro" | "scale";

export const businessPlans: Record<string, Record<PlanKey, string[]>> = {
  salon: {
    starter: ["pos", "inventory", "reports", "staff"],
    pro: [
      "pos", "inventory", "reports", "staff",
      "appointments", "commissions", "tickets",
      "clients", "loyalty", "tips", "export", "reminders"
    ],
    scale: [
      "pos", "inventory", "reports", "staff",
      "appointments", "commissions", "tickets",
      "clients", "loyalty", "tips", "export", "reminders",
      "multi_branch"
    ]
  },
  restaurant: {
    starter: ["pos", "inventory", "reports", "staff", "tables"],
    pro: [
      "pos", "inventory", "reports", "staff", "tables",
      "tips", "loyalty", "clients", "export", "reminders"
    ],
    scale: [
      "pos", "inventory", "reports", "staff", "tables",
      "tips", "loyalty", "clients", "export", "reminders",
      "multi_branch"
    ]
  },
  laundry: {
    starter: ["pos", "inventory", "reports", "staff", "tickets"],
    pro: [
      "pos", "inventory", "reports", "staff", "tickets",
      "commissions", "clients", "loyalty", "export", "reminders"
    ],
    scale: [
      "pos", "inventory", "reports", "staff", "tickets",
      "commissions", "clients", "loyalty", "export", "reminders",
      "multi_branch"
    ]
  },
  sari_sari: {
    starter: ["pos", "inventory", "reports", "expenses", "utang_ledger"],
    pro: [
      "pos", "inventory", "reports", "expenses", "utang_ledger",
      "clients", "loyalty", "export", "reminders"
    ],
    scale: [
      "pos", "inventory", "reports", "expenses", "utang_ledger",
      "clients", "loyalty", "export", "reminders",
      "multi_branch"
    ]
  },
  pharmacy: {
    starter: ["pos", "inventory", "reports", "expenses", "expiry_alerts"],
    pro: [
      "pos", "inventory", "reports", "expenses", "expiry_alerts",
      "clients", "export", "reminders", "loyalty"
    ],
    scale: [
      "pos", "inventory", "reports", "expenses", "expiry_alerts",
      "clients", "export", "reminders", "loyalty",
      "multi_branch"
    ]
  },
  retail: {
    starter: ["pos", "inventory", "reports", "staff"],
    pro: [
      "pos", "inventory", "reports", "staff",
      "clients", "loyalty", "export", "reminders", "tips"
    ],
    scale: [
      "pos", "inventory", "reports", "staff",
      "clients", "loyalty", "export", "reminders", "tips",
      "multi_branch"
    ]
  }
};

