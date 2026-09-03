/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { SignRequestService } from './signRequest.service';

const createSignRequest = catchAsync(async (req, res, next) => {
  const { userId } = req.user as JwtPayload;

  const result = await SignRequestService.createSignRequestIntoDB(
    userId,
    req.body,
  );

  const message = 'Sign request created successfully!';
  sendResponse(res, StatusCodes.OK, true, message, result);
});

const validateSigningToken = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  const result = await SignRequestService.validateSigningTokenFromDB(
    token as string,
  );

  const message = 'Token validated successfully!';
  sendResponse(res, StatusCodes.OK, true, message, result);
});

const sendOtp = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  const result = await SignRequestService.sendSignerOtpBeforeSign(
    token as string,
  );

  const message = 'OTP sent successfully!';
  sendResponse(res, StatusCodes.OK, true, message, result);
});

const verifyOtp = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { otp } = req.body;

  const result = await SignRequestService.verifySignerOtpBeforeSign(
    token as string,
    otp as string,
  );

  const message = 'OTP verified successfully!';
  sendResponse(res, StatusCodes.OK, true, message, result);
});

export const SignRequestController = {
  createSignRequest,
  validateSigningToken,
  sendOtp,
  verifyOtp,
};
