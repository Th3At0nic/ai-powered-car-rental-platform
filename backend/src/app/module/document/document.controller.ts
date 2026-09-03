/* eslint-disable no-unused-vars */
import { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../../utils/catchAsync';
import config from '../../config';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { DocumentService } from './document.service';
import throwAppError from '../../utils/throwAppError';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const uploadPDF = catchAsync(async (req, res, next) => {
  const { userId } = req.user as JwtPayload;

  let uploadedPDF: string = '';
  if (req.file) {
    // uploadedPDF = `${config.url.vps_url}/uploads/${req.file.filename}`; //this is to use in vps environment
    uploadedPDF = `${config.url.base_url}/uploads/${req.file.filename}`; //this is to use in localhost environment
    req.body.uploadedPDF = uploadedPDF;
  }
  if (!req.file) {
    throwAppError('file', 'No file uploaded', StatusCodes.BAD_REQUEST);
  }

  const result = await DocumentService.uploadPdfToDB({
    userId,
    file: req.file as Express.Multer.File,
    fileUrl: uploadedPDF,
  });

  const message = 'Document uploaded successfully!';
  sendResponse(res, StatusCodes.OK, true, message, result);
});

export const DocumentController = {
  uploadPDF,
};
