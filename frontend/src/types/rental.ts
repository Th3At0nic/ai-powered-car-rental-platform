export type TRentalStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type TRentalVehicle = {
  _id?: string;
  name: string;
  brand: string;
  image: string;
  pricePerDay: number;
  category: string;
  location: string;
};

export type TRentalUser = {
  _id?: string;
  fullName: string;
  email: string;
};

export type TRental = {
  _id: string;
  user?: TRentalUser;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  totalDays: number;
  totalAmount: number;
  status: TRentalStatus;
  createdAt?: string;
  vehicle: TRentalVehicle;
};

export type TRentalListResponse = {
  success: boolean;
  message: string;
  data: TRental[];
};

export type TCreateRentalRequest = {
  vehicle: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
};

export type TRentalResponse = {
  success: boolean;
  message: string;
  data: TRental;
};