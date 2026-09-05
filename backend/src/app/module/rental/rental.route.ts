import { Router } from 'express';
import { auth } from '../../middlewares/authRequest';
import { USER_ROLE } from '../user/user.constant';
import { rentalControllers } from './rental.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  createRentalValidationSchema,
  updateRentalStatusValidationSchema,
} from './rental.validation';

const router = Router();

// Customer
router.post(
  '/',
  auth(USER_ROLE.user),
  validateRequest(createRentalValidationSchema),
  rentalControllers.createRental,
);

router.get('/my-rentals', auth(USER_ROLE.user), rentalControllers.getMyRentals);

router.get('/:id', auth(USER_ROLE.user), rentalControllers.getSingleRental);

router.patch(
  '/cancel/:id',
  auth(USER_ROLE.user),
  rentalControllers.cancelRental,
);

// Admin
router.get('/', auth(USER_ROLE.admin), rentalControllers.getAllRentals);

router.patch(
  '/status/:id',
  auth(USER_ROLE.admin),
  validateRequest(updateRentalStatusValidationSchema),
  rentalControllers.updateRentalStatus,
);

export const RentalRoutes = router;
