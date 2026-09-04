/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';
import {
  TFuelType,
  TVehicleCategory,
  TTransmission,
} from './vehicle.constant';

export type TVehicle = {
  _id?: string;
  name: string;
  brand: string;
  category: TVehicleCategory;
  image: string;
  pricePerDay: number;
  seats: number;
  transmission: TTransmission;
  fuelType: TFuelType;
  location: string;
  rating: number;
  isAvailable: boolean;
  description: string;
  features: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

export interface IVehicle extends Model<TVehicle> {}