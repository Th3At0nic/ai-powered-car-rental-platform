import { baseApi } from "./baseApi";

export type TAIRecommendationRequest = {
  preferences: string;
};

export type TAIRecommendationData = {
  vehicleId: string;
  vehicleName: string;
  reason: string;
};

export type TAIRecommendationResponse = {
  success: boolean;
  message: string;
  data: TAIRecommendationData;
};

const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    recommendVehicle: builder.mutation<
      TAIRecommendationResponse,
      TAIRecommendationRequest
    >({
      query: (body) => ({
        url: "/ai/recommend",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useRecommendVehicleMutation } = aiApi;