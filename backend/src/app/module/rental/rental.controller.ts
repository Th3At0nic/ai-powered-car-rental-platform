import { StatusCodes } from 'http-status-codes';

import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { rentalServices } from './rental.service';
import { JwtPayload } from 'jsonwebtoken';

const createRental = catchAsync(async (req, res) => {
  const { userId } = req.user as JwtPayload;

  const result = await rentalServices.createRentalIntoDB(userId, req.body);

  sendResponse(
    res,
    StatusCodes.CREATED,
    true,
    'Rental created successfully',
    result,
  );
});

const getMyRentals = catchAsync(async (req, res) => {
  const { userId } = req.user as JwtPayload;

  const result = await rentalServices.getMyRentalsFromDB(userId);

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    'My rentals fetched successfully',
    result,
  );
});

const getSingleRental = catchAsync(async (req, res) => {
  const { userId } = req.user as JwtPayload;

  const { id } = req.params;

  const result = await rentalServices.getSingleRentalFromDB(
    id as string,
    userId,
  );

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    'Rental fetched successfully',
    result,
  );
});

const cancelRental = catchAsync(async (req, res) => {
  const { userId } = req.user as JwtPayload;

  const result = await rentalServices.cancelRentalFromDB(
    req.params.id as string,
    userId,
  );

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    'Rental cancelled successfully',
    result,
  );
});

const getAllRentals = catchAsync(async (req, res) => {
  const result = await rentalServices.getAllRentalsFromDB();

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    'All rentals fetched successfully',
    result,
  );
});

const updateRentalStatus = catchAsync(async (req, res) => {
  const result = await rentalServices.updateRentalStatusIntoDB(
    req.params.id as string,
    req.body.status,
  );

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    'Rental status updated successfully',
    result,
  );
});

export const rentalControllers = {
  createRental,
  getMyRentals,
  getSingleRental,
  cancelRental,
  getAllRentals,
  updateRentalStatus,
};
