import { Router } from 'express';
import { AuthRoutes } from '../module/auth/auth.route';
import { UserRoutes } from '../module/user/user.route';
import { DocumentRoutes } from '../module/document/document.route';
import { SignRequestRoutes } from '../module/signRequest/signRequest.route';
import { SignatureRoutes } from '../module/signature/signature.route';
import { DashboardRoutes } from '../module/dashboard/dashboard.route';
import { VerificationRoutes } from '../module/verification/verification.route';
import { SubscriptionRoutes } from '../module/subscription/subscription.route';

const router = Router();

const routeModules = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/document',
    route: DocumentRoutes,
  },
  {
    path: '/sign-request',
    route: SignRequestRoutes,
  },
  {
    path: '/signature',
    route: SignatureRoutes,
  },
  {
    path: '/dashboard',
    route: DashboardRoutes,
  },
  {
    path: '/verify',
    route: VerificationRoutes,
  },
  {
    path: '/subscription',
    route: SubscriptionRoutes,
  },
];

routeModules.forEach((route) => router.use(route.path, route.route));

export default router;
