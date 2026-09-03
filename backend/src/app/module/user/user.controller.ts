/* eslint-disable no-unused-vars */
import { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../../utils/catchAsync';
import config from '../../config';
import { UserServices } from './user.service';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updatePasswordAndProfile = catchAsync(async (req, res, next) => {
  const { userId } = req.user as JwtPayload;

  let profilePic: string = '';
  if (req.file) {
    // profilePic = `${config.url.vps_url}/uploads/${req.file.filename}`; //this is to use in vps environment
    profilePic = `${config.url.base_url}/uploads/${req.file.filename}`; //this is to use in localhost environment
    req.body.profilePic = profilePic;
  }

  const result = await UserServices.updatePasswordAndProfileIntoDB(
    userId,
    req.body,
  );
  const message = 'Profile updated successfully!';
  sendResponse(res, StatusCodes.OK, true, message, result);
});

const getMyProfile = catchAsync(async (req, res) => {
  const { userId } = req.user as JwtPayload;

  const result = await UserServices.getMyProfileFromDB(userId);
  sendResponse(
    res,
    StatusCodes.OK,
    true,
    'Profile fetched successfully',
    result,
  );
});

const getProfileCard = catchAsync(async (req, res) => {
  const { userId } = req.user as JwtPayload;

  const result = await UserServices.getProfileCardFromDB(userId);
  sendResponse(
    res,
    StatusCodes.OK,
    true,
    'Profile card generated successfully',
    result,
  );
});

const decodeProfileCard = catchAsync(async (req, res) => {
  const { encryptedPayload } = req.body;

  const result = await UserServices.decodeProfileCard(encryptedPayload);
  sendResponse(
    res,
    StatusCodes.OK,
    true,
    'Profile card decoded successfully',
    result,
  );
});

const submitEidVerification = catchAsync(async (req, res) => {
  const { userId } = req.user as JwtPayload;

  const result = await UserServices.submitEidVerificationIntoDB(
    userId,
    req.body,
  );
  sendResponse(
    res,
    StatusCodes.OK,
    true,
    'eID verification submitted successfully',
    result,
  );
});

const logBiometricCheck = catchAsync(async (req, res) => {
  const { userId } = req.user as JwtPayload;
  const { verified } = req.body;

  const result = await UserServices.logBiometricCheckIntoDB(userId, verified);
  sendResponse(
    res,
    StatusCodes.OK,
    true,
    'Biometric check logged successfully',
    result,
  );
});

const deleteUserPermanently = catchAsync(async (req, res) => {
  const { userId } = req.user as JwtPayload;

  const result = await UserServices.deleteUserPermanentlyFromDb(userId);
  sendResponse(
    res,
    StatusCodes.OK,
    true,
    'User account and all associated records deleted successfully.',
    result,
  );
});

export const UserControllers = {
  updatePasswordAndProfile,
  getMyProfile,
  getProfileCard,
  decodeProfileCard,
  submitEidVerification,
  logBiometricCheck,
  deleteUserPermanently,
};
