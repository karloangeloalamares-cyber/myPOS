import type { BusinessType, FeatureFlags } from '../../types';

// Default feature presets per business type.
export const BUSINESS_PRESETS: Record<BusinessType, FeatureFlags> = {
  SALON:      { enableAppointments: true, enableTickets: true },
  SARI_SARI:  { enableUtangLedger: true },
  RESTAURANT: { enableTables: true, enableTickets: true },
  LAUNDRY:    { enableTickets: true },
  PHARMACY:   { enableExpiryAlerts: true },
};

