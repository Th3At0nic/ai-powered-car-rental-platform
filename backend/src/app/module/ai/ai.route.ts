import { Router } from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { aiControllers } from './ai.controller';
import { aiRecommendationValidationSchema } from './ai.validation';

const router = Router();

router.post(
  '/recommend',
  validateRequest(aiRecommendationValidationSchema),
  aiControllers.getAIRecommendation,
);

export const AIRoutes = router;
