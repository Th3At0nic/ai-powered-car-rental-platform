import { StatusCodes } from 'http-status-codes';

import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { userServices } from './user.service';
import { JwtPayload } from 'jsonwebtoken';

const getMyProfile = catchAsync(async (req, res) => {
  const { userId } = req.user as JwtPayload;

  const result = await userServices.getMyProfileFromDB(userId);

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    'Profile fetched successfully',
    result,
  );
});

export const userControllers = {
  getMyProfile,
};
