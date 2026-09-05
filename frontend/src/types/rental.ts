export type TRentalStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type TRentalVehicle = {
  name: string;
  brand: string;
  image: string;
  pricePerDay: number;
  category: string;
  location: string;
};

export type TRental = {
  _id: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  totalDays: number;
  totalAmount: number;
  status: TRentalStatus;
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