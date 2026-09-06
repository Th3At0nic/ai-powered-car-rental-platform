export type TAIRecommendationRequest = {
  preferences: string;
};

export type TAIRecommendationResponse = {
  vehicleId: string;
  vehicleName: string;
  reason: string;
};
