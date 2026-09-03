import { Router } from 'express';
import { auth } from '../../middlewares/authRequest';
import { USER_ROLE } from '../user/user.constant';
import { SignRequestController } from './signRequest.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  createSignRequestValidationSchema,
  verifyOTPBeforeSignValidationSchema,
} from './signRequest.validation';

const router = Router();

router.post(
  '/create',
  auth(USER_ROLE.sender),
  validateRequest(createSignRequestValidationSchema),
  SignRequestController.createSignRequest,
);

router.get('/validate/:token', SignRequestController.validateSigningToken);

router.post('/send-otp/:token', SignRequestController.sendOtp);

router.post(
  '/verify-otp/:token',
  validateRequest(verifyOTPBeforeSignValidationSchema),
  SignRequestController.verifyOtp,
);

export const SignRequestRoutes = router;
