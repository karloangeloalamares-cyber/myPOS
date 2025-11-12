// Module presets per business vertical (SaaS modules, not feature flags)
// Keys align with BusinessType values
export const BUSINESS_MODULE_PRESETS: Record<string, string[]> = {
  RESTAURANT: ["pos","inventory","reports","staff","tips","loyalty"],
  SALON:      ["pos","inventory","reports","staff","appointments","commissions","clients","loyalty","tickets"],
  LAUNDRY:    ["pos","inventory","reports","staff","tickets"],
  SARI_SARI:  ["pos","inventory","reports","staff"],
  PHARMACY:   ["pos","inventory","reports","staff"],
  RETAIL:     ["pos","inventory","reports","staff","clients","loyalty"],
};

