import { Router } from 'express';
import { auth } from '../../middlewares/authRequest';
import { USER_ROLE } from '../user/user.constant';
import { SubscriptionController } from './subscription.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { linkRevenueCatPurchaseValidationSchema } from './subscription.validation';

const router = Router();

router.get(
  '/status',
  auth(USER_ROLE.sender, USER_ROLE.signer),
  SubscriptionController.getSubscriptionStatus,
);

router.get(
  '/plans',
  auth(USER_ROLE.sender, USER_ROLE.signer),
  SubscriptionController.getAvailablePlans,
);

router.post(
  '/link-purchase',
  auth(USER_ROLE.sender, USER_ROLE.signer),
  validateRequest(linkRevenueCatPurchaseValidationSchema),
  SubscriptionController.linkRevenueCatPurchase,
);

router.post('/webhook/revenuecat', SubscriptionController.revenueCatWebhook);

export const SubscriptionRoutes = router;
