import { validateRequest } from './../../middlewares/validateRequest';
import { Router } from 'express';
import { SignatureController } from './signature.controller';
import { submitSignatureValidationSchema } from './signature.validation';

const router = Router();

router.post(
  '/submit/:token',
  validateRequest(submitSignatureValidationSchema),
  SignatureController.submitSignature,
);

export const SignatureRoutes = router;
