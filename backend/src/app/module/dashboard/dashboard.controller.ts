/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { DashboardService } from './dashboard.service';

const getSenderDashboard = catchAsync(async (req, res, next) => {
  const { userId } = req.user as JwtPayload;

  const result = await DashboardService.getSenderDashboardFromDB(userId);

  const message = 'Sender dashboard fetched successfully!';
  sendResponse(res, StatusCodes.OK, true, message, result);
});

const getSignerDashboard = catchAsync(async (req, res, next) => {
  const { userEmail } = req.user as JwtPayload;

  const result = await DashboardService.getSignerDashboardFromDB(userEmail);

  const message = 'Signer dashboard fetched successfully!';
  sendResponse(res, StatusCodes.OK, true, message, result);
});

const getDocumentDetail = catchAsync(async (req, res, next) => {
  const { userId, role } = req.user as JwtPayload;
  const { documentId } = req.params;

  const result = await DashboardService.getDocumentDetailFromDB(
    userId,
    role,
    documentId as string,
  );

  const message = 'Document detail fetched successfully!';
  sendResponse(res, StatusCodes.OK, true, message, result);
});

export const DashboardController = {
  getSenderDashboard,
  getSignerDashboard,
  getDocumentDetail,
};
