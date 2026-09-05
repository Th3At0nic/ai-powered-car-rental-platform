import { baseApi } from "../../api/baseApi";
import type { TRentalListResponse } from "../../../types/rental";

const rentalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyRentals: builder.query<TRentalListResponse, void>({
      query: () => ({
        url: "/rentals/my-rentals",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetMyRentalsQuery } = rentalApi;