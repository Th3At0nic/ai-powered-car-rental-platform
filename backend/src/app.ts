/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application, NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import { notFound } from './app/middlewares/notFound';
import router from './app/routes';
import path from 'path';
import config from './app/config';
const app: Application = express();
app.set('trust proxy', 1);

const jsonParser = express.json();

app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/v1/verify/webhook')) {
    return next();
  }

  return jsonParser(req, res, next);
});
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use('/api/v1', router);

// app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'))); //this is to serve the uploaded files statically
app.use(
  '/uploads',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const signingToken = req.query.token as string;

      // Method B — Guest signer access via signing token
      if (signingToken && !authHeader) {
        const { SignRequestModel } =
          await import('./app/module/signRequest/signRequest.model');
        const { DocumentModel } =
          await import('./app/module/document/document.model');

        // Find sign request by signer token
        const signRequest = await SignRequestModel.findOne({
          'signers.token': signingToken,
        });

        if (!signRequest) {
          return res.status(401).json({
            success: false,
            message: 'Invalid or expired access token',
          });
        }

        // Find the specific signer
        const signer = signRequest.signers.find(
          (s: any) => s.token === signingToken,
        );

        if (!signer) {
          return res
            .status(401)
            .json({ success: false, message: 'Invalid signing token' });
        }

        // Check signer token expiry
        if (signer.tokenExpiresAt < new Date()) {
          return res
            .status(401)
            .json({ success: false, message: 'Signing token has expired' });
        }

        // Check signer status — revoked or expired signer cannot access
        if (['expired', 'revoked'].includes(signer.status)) {
          return res.status(403).json({
            success: false,
            message: 'This signing session is no longer active',
          });
        }

        // Check overall sign request status — completed requests block guest access
        if (['completed', 'revoked', 'expired'].includes(signRequest.status)) {
          return res.status(403).json({
            success: false,
            message:
              'This signing process has ended. Guest access is no longer permitted.',
          });
        }

        // Find the document belonging to this sign request
        const document = await DocumentModel.findById(signRequest.documentId);

        if (!document) {
          return res
            .status(404)
            .json({ success: false, message: 'Document not found' });
        }

        // Extract the requested filename from the URL
        const requestedFilename = req.path.replace('/', '');

        // Verify the requested file belongs to this specific document
        const originalFilename = document.fileName;
        const signedFilename = document.signedFilePath
          ? path.basename(document.signedFilePath)
          : null;

        const isOriginalFile = requestedFilename === originalFilename;
        const isSignedFile = signedFilename
          ? requestedFilename === signedFilename
          : false;

        if (!isOriginalFile && !isSignedFile) {
          return res.status(403).json({
            success: false,
            message:
              'Access denied. This token does not permit access to the requested file.',
          });
        }

        // All checks passed — allow access
        return next();
      }

      // Method A — Registered user access via JWT
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res
          .status(401)
          .json({ success: false, message: 'Unauthorized' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt_access_secret as string) as {
        userId: string;
        userEmail: string;
      };

      const filename = req.path.replace('/', '');
      const { DocumentModel } =
        await import('./app/module/document/document.model');

      const document = await DocumentModel.findOne({
        $or: [{ fileName: filename }, { signedFilePath: { $regex: filename } }],
      });

      if (!document) {
        return res
          .status(404)
          .json({ success: false, message: 'Document not found' });
      }

      if (String(document.senderId) === decoded.userId) {
        return next();
      }

      const { SignRequestModel } =
        await import('./app/module/signRequest/signRequest.model');
      const signRequest = await SignRequestModel.findOne({
        documentId: document._id,
        'signers.signerEmail': decoded.userEmail,
      });

      if (signRequest) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message:
          'Access denied. You do not have permission to access this document.',
      });
    } catch {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid or expired token' });
    }
  },
  express.static(path.join(process.cwd(), 'uploads')),
);

app.get('/', (req: Request, res: Response) => {
  // res.send('Hello World!');
  res.render('index.ejs');
});

//this is the global error handler
app.use(globalErrorHandler);

// not found handler
app.use(notFound);

export default app;
