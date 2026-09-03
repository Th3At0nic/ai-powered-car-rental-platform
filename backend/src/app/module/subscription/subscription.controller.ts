import { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { SubscriptionService } from './subscription.service';

const getSubscriptionStatus = catchAsync(async (req, res) => {
  const { userId } = req.user as JwtPayload;
  const result = await SubscriptionService.getSubscriptionStatusFromDB(userId);
  sendResponse(
    res,
    StatusCodes.OK,
    true,
    'Subscription status fetched successfully',
    result,
  );
});

const getAvailablePlans = catchAsync(async (req, res) => {
  const result = await SubscriptionService.getAvailablePlansFromDB();
  sendResponse(
    res,
    StatusCodes.OK,
    true,
    'Available plans fetched successfully',
    result,
  );
});

const linkRevenueCatPurchase = catchAsync(async (req, res) => {
  const { userId } = req.user as JwtPayload;
  const payload = req.body;
  const result = await SubscriptionService.linkRevenueCatPurchase(
    userId,
    payload,
  );
  sendResponse(
    res,
    StatusCodes.OK,
    true,
    'Purchase linked successfully',
    result,
  );
});

const revenueCatWebhook = catchAsync(async (req, res) => {
  const payload = req.body;
  const secret = (req.headers['authorization'] ||
    req.headers['x-revenuecat-secret']) as string;

  try {
    await SubscriptionService.handleRevenueCatWebhook(payload, secret);
  } catch (err) {
    // Log error internally so you can debug webhook issues in your logs
    console.error('RevenueCat Webhook Error:', err);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Webhook processed',
    data: { received: true },
  });
});

export const SubscriptionController = {
  getSubscriptionStatus,
  getAvailablePlans,
  linkRevenueCatPurchase,
  revenueCatWebhook,
};

// import { JwtPayload } from 'jsonwebtoken';
// import catchAsync from '../../utils/catchAsync';
// import sendResponse from '../../utils/sendResponse';
// import { StatusCodes } from 'http-status-codes';
// import { SubscriptionService } from './subscription.service';

// const getSubscriptionStatus = catchAsync(async (req, res) => {
//   const { userId } = req.user as JwtPayload;
//   const result = await SubscriptionService.getSubscriptionStatusFromDB(userId);
//   sendResponse(
//     res,
//     StatusCodes.OK,
//     true,
//     'Subscription status fetched successfully',
//     result,
//   );
// });

// const getAvailablePlans = catchAsync(async (req, res) => {
//   const result = await SubscriptionService.getAvailablePlansFromDB();
//   sendResponse(
//     res,
//     StatusCodes.OK,
//     true,
//     'Available plans fetched successfully',
//     result,
//   );
// });

// const verifyApplePurchase = catchAsync(async (req, res) => {
//   const { userId } = req.user as JwtPayload;
//   const { receiptData, environment } = req.body;
//   const result = await SubscriptionService.verifyApplePurchase(
//     userId,
//     receiptData,
//     environment ?? 'sandbox',
//   );
//   sendResponse(
//     res,
//     StatusCodes.OK,
//     true,
//     'Apple purchase verified successfully',
//     result,
//   );
// });

// export const SubscriptionController = {
//   getSubscriptionStatus,
//   getAvailablePlans,
//   verifyApplePurchase,
// };
