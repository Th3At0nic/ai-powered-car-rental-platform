export type TVehicle = {
  _id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  pricePerDay: number;
  seats: number;
  transmission: string;
  fuelType: string;
  location: string;
  rating: number;
  isAvailable: boolean;
  description: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
};

export type TVehicleQueryParams = {
  searchTerm?: string;
  category?: string;
  brand?: string;
  fuelType?: string;
  transmission?: string;
  location?: string;
  isAvailable?: boolean;
  sortBy?: string;
  page?: number;
  limit?: number;
  fields?: string;
};

export type TVehicleResponse = {
  success: boolean;
  message: string;
  data: {
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPage: number;
    };
    data: TVehicle[];
  };
};
