import { Router } from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  createVehicleValidationSchema,
  updateVehicleValidationSchema,
} from './vehicle.validation';
import { VehicleControllers } from './vehicle.controller';

const router = Router();

router.post(
  '/',
  validateRequest(createVehicleValidationSchema),
  VehicleControllers.createVehicle,
);

router.get('/', VehicleControllers.getAllVehicles);

router.get('/:vehicleId', VehicleControllers.getSingleVehicle);

router.patch(
  '/:vehicleId',
  validateRequest(updateVehicleValidationSchema),
  VehicleControllers.updateVehicle,
);

router.delete('/:vehicleId', VehicleControllers.deleteVehicle);

export const VehicleRoutes = router;
