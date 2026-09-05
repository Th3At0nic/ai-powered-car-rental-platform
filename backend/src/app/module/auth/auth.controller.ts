import { StatusCodes } from 'http-status-codes';

import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { authServices } from './auth.service';

const registerUser = catchAsync(async (req, res) => {
  const result = await authServices.registerUserIntoDB(req.body);

  sendResponse(
    res,
    StatusCodes.CREATED,
    true,
    'Registration successful',
    result,
  );
});

const loginUser = catchAsync(async (req, res) => {
  const result = await authServices.loginUserIntoDB(req.body);

  sendResponse(res, StatusCodes.OK, true, 'Login successful', result);
});

export const authControllers = {
  registerUser,
  loginUser,
};
