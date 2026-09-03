import { Router } from 'express';
import { auth } from '../../middlewares/authRequest';
import { USER_ROLE } from '../user/user.constant';
import { DashboardController } from './dashboard.controller';

const router = Router();

router.get(
  '/sender',
  auth(USER_ROLE.sender),
  DashboardController.getSenderDashboard,
);

router.get(
  '/signer',
  auth(USER_ROLE.signer),
  DashboardController.getSignerDashboard,
);

router.get(
  '/document/:documentId',
  auth(USER_ROLE.sender, USER_ROLE.signer),
  DashboardController.getDocumentDetail,
);

export const DashboardRoutes = router;
