import { z } from 'zod';

export const aiRecommendationValidationSchema = z.object({
  body: z.object({
    preferences: z
      .string()
      .trim()
      .min(5, 'Please describe your car requirements')
      .max(1000, 'Preferences cannot exceed 1000 characters'),
  }),
});
