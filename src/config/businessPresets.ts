import type { BusinessType, FeatureFlags } from '../../types';

// Default feature presets per business type (behavioral flags only).
// Tickets is now a full module; keep only vertical behaviors here.
export const BUSINESS_PRESETS: Record<BusinessType, FeatureFlags> = {
  RESTAURANT: { enableTables: true },
  SALON:      { enableAppointments: true },
  LAUNDRY:    {},
  SARI_SARI:  { enableUtangLedger: true },
  PHARMACY:   { enableExpiryAlerts: true },
  RETAIL:     {},
};
