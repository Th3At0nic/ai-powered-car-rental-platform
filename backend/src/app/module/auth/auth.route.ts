import { NextFunction, Request, Response, Router } from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  forgetPasswordValidationSchema,
  loginWithEmailValidationSchema,
  loginWithGoogleValidationSchema,
  registerWithEmailValidationSchema,
  resendOTPValidationSchema,
  verifyOTPValidationSchema,
  refreshTokenValidationSchema,
  resetPasswordValidationSchema,
  loginWithAppleValidationSchema,
} from './auth.validation';
import { authControllers } from './auth.controller';
import { auth } from '../../middlewares/authRequest';
import { USER_ROLE } from '../user/user.constant';
import { upload } from '../../utils/upload';
import throwAppError from '../../utils/throwAppError';
import { StatusCodes } from 'http-status-codes';

const router = Router();

router.post(
  '/register/email',
  validateRequest(registerWithEmailValidationSchema),
  authControllers.registerWithEmail,
);

router.post(
  '/verify-otp',
  validateRequest(verifyOTPValidationSchema),
  authControllers.verifyOTP,
);

router.post(
  '/resend-otp',
  validateRequest(resendOTPValidationSchema),
  authControllers.resendOTP,
);

router.post(
  '/login/google',
  validateRequest(loginWithGoogleValidationSchema),
  authControllers.registerOrLoginWithGoogle,
);

router.post(
  '/login/apple',
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body?.data) {
        req.body = JSON.parse(req.body.data);
      }
      next();
    } catch {
      next(
        throwAppError(
          'data',
          'Invalid JSON format in data field',
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
  },
  validateRequest(loginWithAppleValidationSchema),
  authControllers.registerOrLoginWithApple,
);

router.post(
  '/login/email',
  validateRequest(loginWithEmailValidationSchema),
  authControllers.loginWithEmail,
);

router.post(
  '/forget-password',
  validateRequest(forgetPasswordValidationSchema),
  authControllers.forgetPassword,
);

router.post(
  '/reset-password',
  auth(USER_ROLE.sender, USER_ROLE.signer),
  validateRequest(resetPasswordValidationSchema),
  authControllers.resetPassword,
);

router.post(
  '/refresh-token',
  validateRequest(refreshTokenValidationSchema),
  authControllers.createNewAccessTokenByRefreshToken,
);

export const AuthRoutes = router;
