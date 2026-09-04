import { model, Schema } from 'mongoose';
import { IVehicle, TVehicle } from './vehicle.interface';
import { FUEL_TYPE, TRANSMISSION, VEHICLE_CATEGORY } from './vehicle.constant';

const vehicleSchema = new Schema<TVehicle>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: Object.values(VEHICLE_CATEGORY),
      required: true,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
    },

    seats: {
      type: Number,
      required: true,
      min: 1,
    },

    transmission: {
      type: String,
      enum: Object.values(TRANSMISSION),
      required: true,
    },

    fuelType: {
      type: String,
      enum: Object.values(FUEL_TYPE),
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    features: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const VehicleModel = model<TVehicle, IVehicle>('Vehicle', vehicleSchema);
