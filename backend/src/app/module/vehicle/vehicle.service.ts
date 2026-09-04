import { StatusCodes } from 'http-status-codes';
import throwAppError from '../../utils/throwAppError';
import { TVehicle } from './vehicle.interface';
import { VehicleModel } from './vehicle.model';
import { QueryBuilder } from '../../builder/QueryBuilder';

const createVehicleIntoDB = async (payload: TVehicle) => {
  const result = await VehicleModel.create(payload);

  if (!result) {
    throwAppError(
      'vehicle',
      'Failed to create vehicle',
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return result;
};

const getAllVehiclesFromDB = async (query: Record<string, unknown>) => {
  const { minPrice, maxPrice, minSeats, isAvailable, ...queryForBuilder } =
    query;

  const customFilter: Record<string, unknown> = {};

  // Price range filtering
  if (minPrice || maxPrice) {
    customFilter.pricePerDay = {};

    if (minPrice) {
      (customFilter.pricePerDay as Record<string, number>).$gte =
        Number(minPrice);
    }

    if (maxPrice) {
      (customFilter.pricePerDay as Record<string, number>).$lte =
        Number(maxPrice);
    }
  }

  // Minimum seats filtering
  if (minSeats) {
    customFilter.seats = {
      $gte: Number(minSeats),
    };
  }

  // Availability filtering
  if (isAvailable !== undefined) {
    customFilter.isAvailable =
      isAvailable === true || isAvailable === 'true' || isAvailable === '1';
  }

  const queryBuilder = new QueryBuilder<TVehicle>(
    queryForBuilder,
    VehicleModel.find(customFilter),
  )
    .search(['name', 'brand', 'description', 'location'])
    .filter()
    .sortBy()
    .paginate()
    .fields();

  const meta = await queryBuilder.countTotal();
  const data = await queryBuilder.modelQuery;

  return {
    meta,
    data,
  };
};

const getSingleVehicleFromDB = async (vehicleId: string) => {
  const result = await VehicleModel.findById(vehicleId);

  if (!result) {
    throwAppError('vehicleId', 'Vehicle not found', StatusCodes.NOT_FOUND);
  }

  return result;
};

const updateVehicleIntoDB = async (
  vehicleId: string,
  payload: Partial<TVehicle>,
) => {
  const result = await VehicleModel.findByIdAndUpdate(vehicleId, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throwAppError('vehicleId', 'Vehicle not found', StatusCodes.NOT_FOUND);
  }

  return result;
};

const deleteVehicleFromDB = async (vehicleId: string) => {
  const result = await VehicleModel.findByIdAndDelete(vehicleId);

  if (!result) {
    throwAppError('vehicleId', 'Vehicle not found', StatusCodes.NOT_FOUND);
  }

  return result;
};

export const VehicleServices = {
  createVehicleIntoDB,
  getAllVehiclesFromDB,
  getSingleVehicleFromDB,
  updateVehicleIntoDB,
  deleteVehicleFromDB,
};
