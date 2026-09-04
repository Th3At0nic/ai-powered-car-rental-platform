import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { VehicleServices } from './vehicle.service';

const createVehicle = catchAsync(async (req, res) => {
  const result = await VehicleServices.createVehicleIntoDB(req.body);

  sendResponse(
    res,
    StatusCodes.CREATED,
    true,
    'Vehicle created successfully',
    result,
  );
});

const getAllVehicles = catchAsync(async (req, res) => {
  const result = await VehicleServices.getAllVehiclesFromDB(req.query);

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    'Vehicles fetched successfully',
    result,
  );
});

const getSingleVehicle = catchAsync(async (req, res) => {
  const { vehicleId } = req.params;

  const result = await VehicleServices.getSingleVehicleFromDB(
    vehicleId as string,
  );

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    'Vehicle fetched successfully',
    result,
  );
});

const updateVehicle = catchAsync(async (req, res) => {
  const { vehicleId } = req.params;

  const result = await VehicleServices.updateVehicleIntoDB(
    vehicleId as string,
    req.body,
  );

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    'Vehicle updated successfully',
    result,
  );
});

const deleteVehicle = catchAsync(async (req, res) => {
  const { vehicleId } = req.params;

  const result = await VehicleServices.deleteVehicleFromDB(vehicleId as string);

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    'Vehicle deleted successfully',
    result,
  );
});

export const VehicleControllers = {
  createVehicle,
  getAllVehicles,
  getSingleVehicle,
  updateVehicle,
  deleteVehicle,
};
