/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { VerificationService } from './verification.service';

const startVerification = catchAsync(async (req, res, next) => {
  const { userId } = req.user as JwtPayload;
  const { platform } = req.body;

  const result = await VerificationService.startDiditVerification(
    userId,
    platform,
  );

  const message = 'Verification session created successfully';
  sendResponse(res, StatusCodes.OK, true, message, result);
});

const diditWebhook = catchAsync(async (req, res, next) => {
  try {
    // console.log('=== DIDIT WEBHOOK HIT ===');

    const rawBody = req.body as Buffer;

    const signature = (req.headers['x-signature-v2'] ||
      req.headers['x-signature'] ||
      req.headers['x-signature-simple']) as string;

    const timestamp = (req.headers['x-timestamp'] as string) || '';

    // console.log('Signature header:', signature);
    // console.log('Timestamp header:', timestamp);
    // console.log('Raw body:', rawBody.toString('utf8'));

    const payload = JSON.parse(rawBody.toString('utf8'));

    await VerificationService.handleDiditWebhook(
      rawBody,
      signature,
      timestamp,
      payload,
    );

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Always return 200 to prevent DiDIT retries
    return res.status(200).json({ received: true });
  }
});

const getVerificationStatus = catchAsync(async (req, res, next) => {
  const { userId } = req.user as JwtPayload;

  const result = await VerificationService.getDiditVerificationStatus(userId);

  const message = 'Verification status fetched successfully';
  sendResponse(res, StatusCodes.OK, true, message, result);
});

export const VerificationController = {
  startVerification,
  diditWebhook,
  getVerificationStatus,
};
