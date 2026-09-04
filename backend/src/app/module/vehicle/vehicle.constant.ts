export const VEHICLE_CATEGORY = {
  SEDAN: 'sedan',
  SUV: 'suv',
  HATCHBACK: 'hatchback',
  COUPE: 'coupe',
  LUXURY: 'luxury',
  VAN: 'van',
} as const;

export const TRANSMISSION = {
  AUTOMATIC: 'automatic',
  MANUAL: 'manual',
} as const;

export const FUEL_TYPE = {
  PETROL: 'petrol',
  DIESEL: 'diesel',
  HYBRID: 'hybrid',
  ELECTRIC: 'electric',
} as const;

export type TVehicleCategory =
  (typeof VEHICLE_CATEGORY)[keyof typeof VEHICLE_CATEGORY];

export type TTransmission =
  (typeof TRANSMISSION)[keyof typeof TRANSMISSION];

export type TFuelType = (typeof FUEL_TYPE)[keyof typeof FUEL_TYPE];