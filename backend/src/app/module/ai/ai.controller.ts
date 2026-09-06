import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { aiServices } from './ai.service';

const getAIRecommendation = catchAsync(async (req: Request, res: Response) => {
  const result = await aiServices.getAIRecommendation(req.body);

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    'Vehicle recommendation generated successfully',
    result,
  );
});

export const aiControllers = {
  getAIRecommendation,
};
