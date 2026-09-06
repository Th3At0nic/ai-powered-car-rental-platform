import mongoose from 'mongoose';
import { RentalModel } from './rental.model';
import { VehicleModel } from '../vehicle/vehicle.model';
import { StatusCodes } from 'http-status-codes';
import throwAppError from '../../utils/throwAppError';
import config from '../../config';
import { UserModel } from '../user/user.model';

const createRentalIntoDB = async (
  userId: string,
  payload: {
    vehicle: string;
    pickupLocation: string;
    dropoffLocation: string;
    pickupDate: string;
    dropoffDate: string;
  },
) => {
  const pickupDate = new Date(payload.pickupDate);
  const dropoffDate = new Date(payload.dropoffDate);

  if (
    Number.isNaN(pickupDate.getTime()) ||
    Number.isNaN(dropoffDate.getTime())
  ) {
    throwAppError('date', 'Invalid rental dates', StatusCodes.BAD_REQUEST);
  }

  if (dropoffDate <= pickupDate) {
    throwAppError(
      'date',
      'Dropoff date must be after pickup date',
      StatusCodes.BAD_REQUEST,
    );
  }

  if (pickupDate < new Date()) {
    throwAppError(
      'date',
      'Pickup date cannot be in the past',
      StatusCodes.BAD_REQUEST,
    );
  }

  if (!mongoose.Types.ObjectId.isValid(payload.vehicle)) {
    throwAppError(
      'date',
      'Pickup date cannot be in the past',
      StatusCodes.BAD_REQUEST,
    );
  }

  const vehicle = await VehicleModel.findById(payload.vehicle);

  if (!vehicle) {
    return throwAppError(
      'vehicleId',
      'Vehicle not found',
      StatusCodes.NOT_FOUND,
    );
  }

  if (!vehicle.isAvailable) {
    throwAppError(
      'vehicleId',
      'This vehicle is currently unavailable',
      StatusCodes.FORBIDDEN,
    );
  }

  /*
   * Overlap condition:
   *
   * existing pickup < requested dropoff
   * AND
   * existing dropoff > requested pickup
   *
   * Cancelled rentals are ignored.
   */
  const overlappingRental = await RentalModel.findOne({
    vehicle: payload.vehicle,
    status: { $in: ['pending', 'confirmed'] },
    pickupDate: { $lt: dropoffDate },
    dropoffDate: { $gt: pickupDate },
  });

  if (overlappingRental) {
    throwAppError(
      'vehicleId',
      'This vehicle is already booked for the selected dates',
      StatusCodes.CONFLICT,
    );
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  const totalDays = Math.ceil(
    (dropoffDate.getTime() - pickupDate.getTime()) / millisecondsPerDay,
  );

  const totalAmount = totalDays * vehicle.pricePerDay;

  const rental = await RentalModel.create({
    user: userId,
    vehicle: vehicle._id,

    pickupLocation: payload.pickupLocation,
    dropoffLocation: payload.dropoffLocation,

    pickupDate,
    dropoffDate,

    totalDays,
    pricePerDay: vehicle.pricePerDay,
    totalAmount,

    status: 'pending',
  });

  const userByid = await UserModel.findById(userId).lean();

  if (!userByid) {
    return throwAppError('userByid', 'User not found', StatusCodes.NOT_FOUND);
  }

  try {
    await fetch((config.n8n_webhook_url as string) || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'rental.created',
        rental: rental,
        customer: { name: userByid.fullName, email: userByid.email },
        vehicle: {
          name: vehicle.name,
          brand: vehicle.brand,
          category: vehicle.category,
          fuelType: vehicle.fuelType,
          transmission: vehicle.transmission,
        },
      }),
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log('n8n automation failed, here is the reason: ', error);
  }

  return rental;
};

const getMyRentalsFromDB = async (userId: string) => {
  return RentalModel.find({ user: userId })
    .populate('vehicle', 'name brand image pricePerDay category location')
    .sort({ createdAt: -1 });
};

const getSingleRentalFromDB = async (rentalId: string, userId: string) => {
  const rental = await RentalModel.findOne({
    _id: rentalId,
    user: userId,
  }).populate('vehicle', 'name brand image pricePerDay category location');

  if (!rental) {
    throwAppError('rentalId', 'Rental not found', StatusCodes.NOT_FOUND);
  }

  return rental;
};

const cancelRentalFromDB = async (rentalId: string, userId: string) => {
  const rental = await RentalModel.findOne({
    _id: rentalId,
    user: userId,
  });

  if (!rental) {
    return throwAppError('rentalId', 'Rental not found', StatusCodes.NOT_FOUND);
  }

  if (rental.status === 'cancelled') {
    throwAppError(
      'status',
      'Rental is already cancelled',
      StatusCodes.BAD_REQUEST,
    );
  }

  if (rental.status === 'completed') {
    throwAppError(
      'status',
      'Completed rental cannot be cancelled',
      StatusCodes.BAD_REQUEST,
    );
  }

  rental.status = 'cancelled';

  await rental.save();

  return rental;
};

const getAllRentalsFromDB = async () => {
  return RentalModel.find()
    .populate('user', 'fullName email')
    .populate('vehicle', 'name brand image pricePerDay category')
    .sort({ createdAt: -1 });
};

const updateRentalStatusIntoDB = async (
  rentalId: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
) => {
  const rental = await RentalModel.findById(rentalId);

  if (!rental) {
    return throwAppError('rentalId', 'Rental not found', StatusCodes.NOT_FOUND);
  }

  rental.status = status;

  await rental.save();

  return rental;
};

export const rentalServices = {
  createRentalIntoDB,
  getMyRentalsFromDB,
  getSingleRentalFromDB,
  cancelRentalFromDB,
  getAllRentalsFromDB,
  updateRentalStatusIntoDB,
};
