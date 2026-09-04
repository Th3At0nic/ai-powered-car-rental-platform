/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { authServices } from './auth.service';
import config from '../../config';

//imported HOF(catchAsync()) to pass the async func there to handle the promise and error, reduced boilerplates

const registerWithEmail = catchAsync(async (req, res, next) => {
  const result = await authServices.registerWithEmailIntoDB(req.body);
  // const message = 'Registered Successfully!';
  sendResponse(res, StatusCodes.CREATED, true, result?.message as string, null);
});

const verifyOTP = catchAsync(async (req, res, next) => {
  const result = await authServices.verifyOTPIntoDB(req.body);
  const message = 'Account Verified Successfully!';
  sendResponse(res, StatusCodes.OK, true, message, result);
});

const resendOTP = catchAsync(async (req, res, next) => {
  const result = await authServices.resendOTPFromDB(req.body);
  // const message = 'Resent Successfully!';
  sendResponse(res, StatusCodes.OK, true, result?.message as string, null);
});

const registerOrLoginWithApple = catchAsync(async (req, res, next) => {
  let profilePic: string = '';
  if (req.file) {
    // profilePic = `${config.url.vps_image}/uploads/${req.file.filename}`; //this is to use in vps environment
    profilePic = `${config.url.base_url}/uploads/${req.file.filename}`; //this is to use in localhost environment
    req.body.profilePic = profilePic;
  }

  const result = await authServices.registerOrLoginWithAppleIntoDB(req.body);
  const { accessToken, refreshToken, userDoc } = result!;

  //   res.cookie('refreshToken', refreshToken, {
  //   httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
  //   secure: process.env.NODE_ENV === 'production', // Ensures the cookie is sent only over HTTPS in production
  //   sameSite: 'lax', // Prevents CSRF attacks
  //   maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  // });

  const message = 'Login with apple Successful!';
  sendResponse(res, StatusCodes.OK, true, message, {
    accessToken,
    refreshToken,
    userDoc,
  });
});

const loginWithEmail = catchAsync(async (req, res, next) => {
  const result = await authServices.loginWithEmailIntoDB(req.body);
  const { accessToken, refreshToken, user } = result!;

  // res.cookie('refreshToken', refreshToken, {
  //   httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
  //   secure: process.env.NODE_ENV === 'production', // Ensures the cookie is sent only over HTTPS in production
  //   sameSite: 'lax', // Prevents CSRF attacks
  //   maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  // });

  const message = 'Login Successful!';
  sendResponse(res, StatusCodes.OK, true, message, {
    accessToken,
    refreshToken,
    user,
  });
});

const forgetPassword = catchAsync(async (req, res, next) => {
  const result = await authServices.forgetPasswordIntoDB(req.body);
  const message = 'Password reset OTP sent to your email!';
  sendResponse(res, StatusCodes.OK, true, result?.message as string, null);
});

const resetPassword = catchAsync(async (req, res, next) => {
  const userId = req?.user?.userId;

  req.body.userId = userId;

  const result = await authServices.resetPasswordIntoDB(req.body);
  // const message = 'Password reset successfully!';
  sendResponse(res, StatusCodes.OK, true, result!.message, null);
});

const createNewAccessTokenByRefreshToken = catchAsync(
  async (req, res, next) => {
    const { refreshToken } = req.body;

    const result =
      await authServices.createNewAccessTokenByRefreshToken(refreshToken);
    const message = 'Access Token retrieved successfully';
    sendResponse(res, 200, true, message, result);
  },
);

export const authControllers = {
  registerWithEmail,
  verifyOTP,
  resendOTP,
  registerOrLoginWithApple,
  loginWithEmail,
  forgetPassword,
  resetPassword,
  createNewAccessTokenByRefreshToken,
};
