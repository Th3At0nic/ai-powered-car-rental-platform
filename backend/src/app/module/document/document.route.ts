/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response, Router } from 'express';
import { auth } from '../../middlewares/authRequest';
import { USER_ROLE } from '../user/user.constant';
import { upload } from '../../utils/upload';
import throwAppError from '../../utils/throwAppError';
import { StatusCodes } from 'http-status-codes';
import { DocumentController } from './document.controller';

const router = Router();

router.post(
  '/upload',
  auth(USER_ROLE.sender),
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err: any) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            throwAppError(
              'file',
              'File size exceeds 20MB limit',
              StatusCodes.BAD_REQUEST,
            ),
          );
        }
        return next(
          throwAppError(
            'file',
            err.message || 'File upload error',
            StatusCodes.BAD_REQUEST,
          ),
        );
      }
      next();
    });
  },
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body?.data) {
        req.body = JSON.parse(req.body.data);
      }
      next();
    } catch {
      next(
        throwAppError(
          'data',
          'Invalid JSON format in data field',
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
  },
  DocumentController.uploadPDF,
);

export const DocumentRoutes = router;
