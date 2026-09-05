import { Router } from 'express';

import { auth } from '../../middlewares/authRequest';
import { USER_ROLE } from './user.constant';
import { userControllers } from './user.controller';

const router = Router();

router.get(
  '/me',
  auth(USER_ROLE.user, USER_ROLE.admin),
  userControllers.getMyProfile,
);

export const UserRoutes = router;
