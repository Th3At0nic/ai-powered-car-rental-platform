import { Router } from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { authControllers } from './auth.controller';
import {
  loginValidationSchema,
  registerValidationSchema,
} from './auth.validation';

const router = Router();

router.post(
  '/register',
  validateRequest(registerValidationSchema),
  authControllers.registerUser,
);

router.post(
  '/login',
  validateRequest(loginValidationSchema),
  authControllers.loginUser,
);

export const AuthRoutes = router;
