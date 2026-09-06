import { GoogleGenerativeAI } from '@google/generative-ai';
import { StatusCodes } from 'http-status-codes';
import { VehicleModel } from '../vehicle/vehicle.model';
import { TAIRecommendationRequest } from './ai.interface';
import config from '../../config';
import throwAppError from '../../utils/throwAppError';

const gemini = new GoogleGenerativeAI(config.gemini_api_key as string);

const model = gemini.getGenerativeModel({
  model: 'gemini-3.6-flash',
});

const getAIRecommendation = async (payload: TAIRecommendationRequest) => {
  const { preferences } = payload;

  const vehicles = await VehicleModel.find({
    isAvailable: true,
  }).lean();

  if (!vehicles.length) {
    throwAppError(
      'vehicles',
      'No available vehicles found for recommendation',
      StatusCodes.NOT_FOUND,
    );
  }

  const vehicleData = vehicles.map((vehicle) => ({
    id: vehicle._id.toString(),
    name: vehicle.name,
    brand: vehicle.brand,
    category: vehicle.category,
    pricePerDay: vehicle.pricePerDay,
    seats: vehicle.seats,
    transmission: vehicle.transmission,
    fuelType: vehicle.fuelType,
    location: vehicle.location,
    rating: vehicle.rating,
    description: vehicle.description,
    features: vehicle.features,
  }));

  const prompt = `
You are an AI vehicle recommendation assistant for DrivePilot,
an AI-powered car rental platform.

The customer described their requirements as:

"${preferences}"

Here is the list of vehicles currently available for rental:

${JSON.stringify(vehicleData, null, 2)}

Your task is to recommend the SINGLE best vehicle from the provided list.

IMPORTANT RULES:
1. Only recommend a vehicle that exists in the provided list.
2. Never invent a vehicle.
3. Return the exact vehicle ID from the provided data.
4. Consider the customer's requirements such as:
   - vehicle type/category
   - number of seats
   - fuel type
   - transmission
   - price
   - location
   - features
5. If the customer does not specify something, use reasonable judgment.
6. Keep the reason concise and helpful.
7. Return ONLY valid JSON.
8. Do not use markdown code fences.

Required JSON format:

{
  "vehicleId": "exact vehicle id",
  "reason": "short explanation of why this vehicle is a good match"
}
`;

  try {
    const result = await model.generateContent(prompt);

    const responseText = result.response.text().trim();

    let recommendation: {
      vehicleId?: string;
      reason?: string;
    } = {};

    try {
      recommendation = JSON.parse(responseText);
    } catch {
      throwAppError(
        'ai',
        'AI returned an invalid recommendation format',
        StatusCodes.BAD_GATEWAY,
      );
    }

    if (!recommendation.vehicleId || !recommendation.reason) {
      throwAppError(
        'ai',
        'AI returned an incomplete recommendation',
        StatusCodes.BAD_GATEWAY,
      );
    }

    const recommendedVehicle = vehicles.find(
      (vehicle) => vehicle._id.toString() === recommendation.vehicleId,
    );

    if (!recommendedVehicle) {
      return throwAppError(
        'vehicleId',
        'AI recommended a vehicle that is not available',
        StatusCodes.BAD_GATEWAY,
      );
    }

    return {
      vehicleId: recommendedVehicle._id.toString(),
      vehicleName: recommendedVehicle.name,
      reason: recommendation.reason,
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      console.log('here is the ai error:', error);
      throw error;
    }

    console.log('here is the ai error 2:', error);

    throwAppError(
      'ai',
      'Failed to generate vehicle recommendation',
      StatusCodes.BAD_GATEWAY,
    );
  }
};

export const aiServices = {
  getAIRecommendation,
};
