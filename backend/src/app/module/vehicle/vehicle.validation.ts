import z from 'zod';
import { FUEL_TYPE, TRANSMISSION, VEHICLE_CATEGORY } from './vehicle.constant';

const vehicleBodySchema = z.object({
  name: z.string().min(1, 'Vehicle name is required'),
  brand: z.string().min(1, 'Vehicle brand is required'),

  category: z.enum([
    VEHICLE_CATEGORY.SEDAN,
    VEHICLE_CATEGORY.SUV,
    VEHICLE_CATEGORY.HATCHBACK,
    VEHICLE_CATEGORY.COUPE,
    VEHICLE_CATEGORY.LUXURY,
    VEHICLE_CATEGORY.VAN,
  ]),

  image: z.string().url('Invalid vehicle image URL'),

  pricePerDay: z.number().positive('Price per day must be greater than 0'),

  seats: z
    .number()
    .int('Seats must be a whole number')
    .min(1, 'Vehicle must have at least one seat'),

  transmission: z.enum([TRANSMISSION.AUTOMATIC, TRANSMISSION.MANUAL]),

  fuelType: z.enum([
    FUEL_TYPE.PETROL,
    FUEL_TYPE.DIESEL,
    FUEL_TYPE.HYBRID,
    FUEL_TYPE.ELECTRIC,
  ]),

  location: z.string().min(1, 'Vehicle location is required'),

  rating: z.number().min(0).max(5).optional(),

  isAvailable: z.boolean().optional(),

  description: z.string().min(1, 'Vehicle description is required'),

  features: z.array(z.string()).optional(),
});

export const createVehicleValidationSchema = z.object({
  body: vehicleBodySchema,
});

export const updateVehicleValidationSchema = z.object({
  body: vehicleBodySchema.partial(),
});
