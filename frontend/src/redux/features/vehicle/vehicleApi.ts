import { baseApi } from "../../api/baseApi";
import {
  TVehicleListResponse,
  TVehicleQueryParams,
  TVehicleSingleResponse,
} from "../../../types/vehicle";

const vehicleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllVehicles: builder.query<TVehicleListResponse, TVehicleQueryParams>({
      query: (params) => ({
        url: "/vehicles",
        method: "GET",
        params,
      }),
    }),

    getSingleVehicle: builder.query<TVehicleSingleResponse, string>({
      query: (vehicleId) => ({
        url: `/vehicles/${vehicleId}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetAllVehiclesQuery, useGetSingleVehicleQuery } = vehicleApi;
