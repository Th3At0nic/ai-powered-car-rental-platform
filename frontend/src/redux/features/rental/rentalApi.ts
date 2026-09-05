import { baseApi } from "../../api/baseApi";
import type {
  TCreateRentalRequest,
  TRentalListResponse,
  TRentalResponse,
} from "../../../types/rental";

const rentalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllRentals: builder.query<TRentalListResponse, void>({
      query: () => ({
        url: "/rentals",
        method: "GET",
      }),
      providesTags: ["Rentals"],
    }),
    getMyRentals: builder.query<TRentalListResponse, void>({
      query: () => ({
        url: "/rentals/my-rentals",
        method: "GET",
      }),
      providesTags: ["Rentals"],
    }),
    createRental: builder.mutation<TRentalResponse, TCreateRentalRequest>({
      query: (body) => ({
        url: "/rentals",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Rentals"],
    }),
  }),
});

export const {
  useGetAllRentalsQuery,
  useGetMyRentalsQuery,
  useCreateRentalMutation,
} = rentalApi;