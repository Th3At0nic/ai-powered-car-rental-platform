import { z } from 'zod';

export const createRentalValidationSchema = z.object({
  body: z.object({
    vehicle: z.string().min(1, 'Vehicle ID is required'),

    pickupLocation: z.string().trim().min(2, 'Pickup location is required'),

    dropoffLocation: z.string().trim().min(2, 'Dropoff location is required'),

    pickupDate: z.string().min(1, 'Pickup date is required'),

    dropoffDate: z.string().min(1, 'Dropoff date is required'),
  }),
});

export const RENTAL_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export const updateRentalStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([
      RENTAL_STATUS.PENDING,
      RENTAL_STATUS.CONFIRMED,
      RENTAL_STATUS.CANCELLED,
      RENTAL_STATUS.COMPLETED,
    ]),
  }),
});
