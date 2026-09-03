import { NextFunction, Request, Response, Router } from 'express';
import { auth } from '../../middlewares/authRequest';
import { USER_ROLE } from './user.constant';
import { upload } from '../../utils/upload';
import throwAppError from '../../utils/throwAppError';
import { StatusCodes } from 'http-status-codes';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  decodeProfileCardValidationSchema,
  submitEidVerificationValidationSchema,
  updatePasswordAndProfileValidationSchema,
} from './user.validation';
import { UserControllers } from './user.controller';

const router = Router();

router.patch(
  '/update-profile',
  auth(USER_ROLE.sender, USER_ROLE.signer),
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
  validateRequest(updatePasswordAndProfileValidationSchema),
  UserControllers.updatePasswordAndProfile,
);

router.get(
  '/me',
  auth(USER_ROLE.sender, USER_ROLE.signer),
  UserControllers.getMyProfile,
);

router.get(
  '/profile-card',
  auth(USER_ROLE.sender, USER_ROLE.signer),
  UserControllers.getProfileCard,
);

router.post(
  '/profile-card/decode',
  auth(USER_ROLE.sender, USER_ROLE.signer),
  validateRequest(decodeProfileCardValidationSchema),
  UserControllers.decodeProfileCard,
);

router.post(
  '/verify/eid',
  auth(USER_ROLE.sender, USER_ROLE.signer),
  validateRequest(submitEidVerificationValidationSchema),
  UserControllers.submitEidVerification,
);

// router.post(
//   '/verify/biometric',
//   auth(USER_ROLE.sender, USER_ROLE.signer),
//   validateRequest(logBiometricCheckValidationSchema),
//   UserControllers.logBiometricCheck,
// );

// router.delete(
//   '/delete/me',
//   auth(USER_ROLE.sender, USER_ROLE.signer),
//   UserControllers.deleteUserPermanently,
// );

export const UserRoutes = router;
