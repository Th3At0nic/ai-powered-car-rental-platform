import { Types } from 'mongoose';

export type TRentalStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type TRental = {
  _id?: string;
  user: Types.ObjectId;
  vehicleId: Types.ObjectId;

  pickupLocation: string;
  dropoffLocation: string;

  pickupDate: Date;
  dropoffDate: Date;

  totalDays: number;
  pricePerDay: number;
  totalAmount: number;

  status: TRentalStatus;

  createdAt?: Date;
  updatedAt?: Date;
};
