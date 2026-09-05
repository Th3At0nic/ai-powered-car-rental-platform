import { Router } from 'express';
import { AuthRoutes } from '../module/auth/auth.route';
import { UserRoutes } from '../module/user/user.route';
import { VehicleRoutes } from '../module/vehicle/vehicle.route';
import { RentalRoutes } from '../module/rental/rental.route';

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
    path: '/vehicles',
    route: VehicleRoutes,
  },
  {
    path: '/rentals',
    route: RentalRoutes,
  },
];

routeModules.forEach((route) => router.use(route.path, route.route));

export default router;
