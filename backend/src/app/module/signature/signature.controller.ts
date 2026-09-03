/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { SignatureService } from './signature.service';

const submitSignature = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const ipAddress = req.ip as string;

  const userAgent = req.headers['user-agent'] ?? 'Unknown';

  const result = await SignatureService.submitSignatureIntoDB(
    token as string,
    req.body,
    ipAddress,
    userAgent,
  );

  const message = 'Signature submitted successfully!';
  sendResponse(res, StatusCodes.OK, true, message, result);
});

export const SignatureController = {
  submitSignature,
};
