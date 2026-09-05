import mongoose from 'mongoose';
import { RentalModel } from './rental.model';
import { VehicleModel } from '../vehicle/vehicle.model';

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
    throw new Error('Invalid rental dates');
  }

  if (dropoffDate <= pickupDate) {
    throw new Error('Dropoff date must be after pickup date');
  }

  if (pickupDate < new Date()) {
    throw new Error('Pickup date cannot be in the past');
  }

  if (!mongoose.Types.ObjectId.isValid(payload.vehicle)) {
    throw new Error('Invalid vehicle ID');
  }

  const vehicle = await VehicleModel.findById(payload.vehicle);

  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  if (!vehicle.isAvailable) {
    throw new Error('This vehicle is currently unavailable');
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
    throw new Error('This vehicle is already booked for the selected dates');
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
    throw new Error('Rental not found');
  }

  return rental;
};

const cancelRentalFromDB = async (rentalId: string, userId: string) => {
  const rental = await RentalModel.findOne({
    _id: rentalId,
    user: userId,
  });

  if (!rental) {
    throw new Error('Rental not found');
  }

  if (rental.status === 'cancelled') {
    throw new Error('Rental is already cancelled');
  }

  if (rental.status === 'completed') {
    throw new Error('Completed rental cannot be cancelled');
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
    throw new Error('Rental not found');
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
