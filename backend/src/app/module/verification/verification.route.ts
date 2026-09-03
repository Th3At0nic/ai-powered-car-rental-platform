import express, { Router } from 'express';
import { auth } from '../../middlewares/authRequest';
import { USER_ROLE } from '../user/user.constant';
import { VerificationController } from './verification.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { diditStartVerificationValidationSchema } from './verification.validation';

const router = Router();

router.post(
  '/start',
  auth(USER_ROLE.sender, USER_ROLE.signer),
  validateRequest(diditStartVerificationValidationSchema),
  VerificationController.startVerification,
);

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  VerificationController.diditWebhook,
);

router.get(
  '/status',
  auth(USER_ROLE.sender, USER_ROLE.signer),
  VerificationController.getVerificationStatus,
);

export const VerificationRoutes = router;
