/* eslint-disable no-console */
import { StatusCodes } from 'http-status-codes';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import throwAppError from '../../utils/throwAppError';
import config from '../../config';
import { SignRequestModel } from '../signRequest/signRequest.model';
import { DocumentModel } from '../document/document.model';
import { SignatureModel } from './signature.model';
import { TSubmitSignaturePayload } from './signature.interface';
import { UserModel } from '../user/user.model';
import {
  sendPartialSigningNotificationEmail,
  sendSignedDocumentEmail,
} from '../../utils/sendEmail';
import { createAuditLog } from '../../utils/createAuditLog';
import { USER_ROLE } from '../user/user.constant';

const submitSignatureIntoDB = async (
  token: string,
  payload: TSubmitSignaturePayload,
  ipAddress: string,
  userAgent: string,
) => {
  if (!payload.consentGiven) {
    return throwAppError(
      'consent',
      'You must agree to the electronic signature terms',
      StatusCodes.BAD_REQUEST,
    );
  }

  const signRequest = await SignRequestModel.findOne({
    'signers.token': token,
  });

  if (!signRequest) {
    return throwAppError(
      'token',
      'Invalid signing link',
      StatusCodes.BAD_REQUEST,
    );
  }

  const signer = signRequest.signers.find(
    (signerItem) => signerItem.token === token,
  );

  if (!signer) {
    return throwAppError(
      'token',
      'Invalid signing link',
      StatusCodes.BAD_REQUEST,
    );
  }

  if (signer.signerEmail !== payload.signerEmail) {
    return throwAppError(
      'signerEmail',
      'You are not authorized to sign this document',
      StatusCodes.FORBIDDEN,
    );
  }

  if (signer.status === 'signed') {
    throwAppError(
      'token',
      'You have already signed this document',
      StatusCodes.BAD_REQUEST,
    );
  }

  if (signer.status === 'expired' || signer.status === 'revoked') {
    throwAppError(
      'token',
      'This signing link is no longer valid',
      StatusCodes.BAD_REQUEST,
    );
  }

  const smsRequired =
    signRequest.smsVerificationMode === 'all' ||
    (signRequest.smsVerificationMode === 'individual' &&
      signer.requireSms === true);

  if (smsRequired && !signer.smsVerified) {
    return throwAppError(
      'smsVerification',
      'SMS verification is required before signing this document.',
      StatusCodes.FORBIDDEN,
    );
  }

  const signerUser = await UserModel.findOne({ email: signer.signerEmail });

  if (signRequest.requireIdCheck) {
    const isVerificationValid =
      signerUser?.diditVerified === true &&
      signerUser?.diditVerificationExpiresAt &&
      signerUser.diditVerificationExpiresAt > new Date();

    if (!isVerificationValid) {
      return throwAppError(
        'identityVerification',
        'Identity verification is required before signing this document. Please complete DiDIT verification first.',
        StatusCodes.FORBIDDEN,
      );
    }
  }

  if (new Date(signer.tokenExpiresAt).getTime() < Date.now()) {
    await SignRequestModel.findOneAndUpdate(
      { 'signers.token': token },
      { $set: { 'signers.$.status': 'expired' } },
    );

    throwAppError(
      'token',
      'This signing link has expired',
      StatusCodes.BAD_REQUEST,
    );
  }

  if (signRequest.status === 'completed') {
    throwAppError(
      'token',
      'This document has already been fully signed by all parties',
      StatusCodes.BAD_REQUEST,
    );
  }

  const document = await DocumentModel.findById(signRequest.documentId);

  if (!document) {
    return throwAppError(
      'documentId',
      'Document not found',
      StatusCodes.NOT_FOUND,
    );
  }

  const pdfToRead =
    document.signedFilePath && fs.existsSync(document.signedFilePath)
      ? document.signedFilePath
      : document.filePath;
  const originalPdfBytes = fs.readFileSync(pdfToRead);
  const pdfDoc = await PDFDocument.load(originalPdfBytes);

  const pageIndex = signer.signatureFieldPosition.page - 1;
  const page = pdfDoc.getPages()[pageIndex];

  if (!page) {
    throwAppError('page', 'Signature page not found', StatusCodes.BAD_REQUEST);
  }

  const signatureData = payload.signatureImage;
  const isJpeg =
    signatureData.startsWith('data:image/jpeg') ||
    signatureData.startsWith('data:image/jpg');

  const base64Signature = signatureData.includes('base64,')
    ? signatureData.split('base64,')[1]
    : signatureData;
  const signatureBuffer = Buffer.from(base64Signature, 'base64');

  const embeddedImage = isJpeg
    ? await pdfDoc.embedJpg(signatureBuffer)
    : await pdfDoc.embedPng(signatureBuffer);

  const { x, y, width, height } = signer.signatureFieldPosition;

  page.drawImage(embeddedImage, {
    x,
    y,
    width,
    height,
  });

  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const readableDate = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });

  const stampLines = [
    '[ DIGITALLY SIGNED ]',
    `Signed by: ${payload.signerName}`,
    `Email:      ${payload.signerEmail}`,
    `Date:       ${readableDate} UTC`,
    `IP Address: ${ipAddress}`,
  ];

  if (
    typeof payload.gpsLatitude === 'number' &&
    typeof payload.gpsLongitude === 'number'
  ) {
    const lat = payload.gpsLatitude.toFixed(6);
    const lng = payload.gpsLongitude.toFixed(6);
    stampLines.push(`Location:   ${lat}°N, ${lng}°E`);
  }

  const stampFontSize = 8;
  const headerFontSize = 10; // "DIGITALLY SIGNED" header
  const nameFontSize = 8;
  const lineHeight = 11;
  const stampPadding = 8;
  const stampWidth = Math.max(width, 170);
  const stampHeight = stampLines.length * lineHeight + stampPadding * 2 + 4;
  const stampX = x;
  const stampY = y - stampHeight - 10;

  page.drawRectangle({
    x: stampX,
    y: stampY,
    width: stampWidth,
    height: stampHeight,
    color: rgb(0.97, 0.97, 0.97),
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 0.5,
  });

  page.drawLine({
    start: { x: stampX, y: stampY + stampHeight },
    end: { x: stampX + stampWidth, y: stampY + stampHeight },
    thickness: 2,
    color: rgb(0.18, 0.38, 0.58),
  });

  page.drawLine({
    start: { x: stampX, y: y - 6 },
    end: { x: stampX + stampWidth, y: y - 6 },
    thickness: 1,
    color: rgb(0.4, 0.4, 0.4),
  });

  const textStartY = stampY + stampHeight - stampPadding - stampFontSize;

  stampLines.forEach((line, index) => {
    const isHeader = index === 0;
    const isName = index === 1;

    page.drawText(line, {
      x: stampX + stampPadding,
      y: textStartY - index * lineHeight,
      size: isHeader ? headerFontSize : isName ? nameFontSize : stampFontSize,
      font: isHeader || isName ? boldFont : regularFont,
      color: isHeader
        ? rgb(0.18, 0.38, 0.58) // blue for header
        : isName
          ? rgb(0.1, 0.1, 0.1) // near black for name
          : rgb(0.3, 0.3, 0.3), // dark gray for rest
    });
  });

  const signedPdfBytes = await pdfDoc.save();
  const signedFileName = `signed-${document.fileName}`;
  const signedFilePath = path.join(
    path.dirname(document.filePath),
    signedFileName,
  );
  fs.writeFileSync(signedFilePath, signedPdfBytes);

  const signedFileUrl = `${config.url.base_url}/uploads/${signedFileName}`;
  const signedHash = crypto
    .createHash('sha256')
    .update(Buffer.from(signedPdfBytes))
    .digest('hex');

  const signatureRecord = await SignatureModel.create({
    documentId: document._id,
    signRequestId: signRequest._id,
    signerName: payload.signerName,
    signerEmail: payload.signerEmail,
    signatureImage: payload.signatureImage,
    signedPdfPath: signedFilePath,
    signedPdfUrl: signedFileUrl,
    ipAddress,
    gpsLatitude: payload.gpsLatitude,
    gpsLongitude: payload.gpsLongitude,
    signedAt: new Date(),
    userAgent, //storing the browser/device information for audit trail
    consentGiven: true,
  });

  await SignRequestModel.findOneAndUpdate(
    { 'signers.token': token },
    {
      $set: {
        'signers.$.status': 'signed',
        'signers.$.signedAt': new Date(),
      },
    },
  );

  const updatedSignRequest = await SignRequestModel.findById(signRequest._id);
  const allSigned = updatedSignRequest!.signers.every(
    (signerItem) => signerItem.status === 'signed',
  );
  const signedCount = updatedSignRequest!.signers.filter(
    (signerItem) => signerItem.status === 'signed',
  ).length;
  const totalSigners = updatedSignRequest!.signers.length;

  if (allSigned) {
    await SignRequestModel.findByIdAndUpdate(signRequest._id, {
      status: 'completed',
      completedAt: new Date(),
    });
    await DocumentModel.findByIdAndUpdate(document._id, {
      status: 'completed',
      signedFilePath,
      signedFileUrl,
      signedHash,
      completedAt: new Date(),
    });
  } else {
    await SignRequestModel.findByIdAndUpdate(signRequest._id, {
      status: 'partially_signed',
    });
    await DocumentModel.findByIdAndUpdate(document._id, {
      signedFilePath,
      signedFileUrl,
      signedHash,
    });
  }

  /////////// PLEASE READ THE BELOW COMMENTS --- its CRITICAL ------//////////////

  // below Audit log is intentionally called without try/catch.

  // createAuditLog() handles its own errors internally and never throws.

  // If logging fails, it silently console.errors and returns — the main flow is never blocked.

  // DO NOT wrap this in try/catch or move it before DB operations.

  // Audit logging is non-critical — it must never affect the core business logic.

  await createAuditLog({
    documentId: String(document._id),
    signRequestId: String(signRequest._id),
    actorRole: USER_ROLE.signer,
    action: 'document_signed',
    description: `Document signed by ${payload.signerName} (${signedCount} of ${totalSigners} signatures complete)`,
    ipAddress,
    gpsLatitude: payload.gpsLatitude,
    gpsLongitude: payload.gpsLongitude,
    metadata: {
      signerEmail: payload.signerEmail,
      signerName: payload.signerName,
      diditVerified: signerUser?.diditVerified ?? false,
      diditVerificationStatus:
        signerUser?.diditVerificationStatus ?? 'not_started',
      diditPlatform: signerUser?.diditPlatform ?? null,
      signedPdfUrl: signedFileUrl,
      smsVerificationRequired: smsRequired,
      smsVerified: signer.smsVerified,
      smsVerifiedAt: signer.smsVerifiedAt,
      phoneNumberMasked: signer.signerPhone
        ? signer.signerPhone.slice(-4).padStart(signer.signerPhone.length, '*')
        : null,
      smsFailedAttempts: signer.smsFailedAttempts,
      smsOtpExpiresAt: signer.smsOtpExpiresAt,
    },
  });

  //this below code is for sending email to signer & sender after signature is done successfully

  let emailWarning: string | null = null;
  const sender = await UserModel.findById(document.senderId);

  try {
    await sendSignedDocumentEmail(
      payload.signerEmail,
      payload.signerName,
      document.originalName,
      signedFilePath,
      'signer',
    );

    if (allSigned) {
      if (sender?.email) {
        await sendSignedDocumentEmail(
          sender.email,
          sender.fullName,
          document.originalName,
          signedFilePath,
          'sender',
        );
      }

      if (updatedSignRequest) {
        for (const s of updatedSignRequest.signers) {
          if (s.signerEmail !== payload.signerEmail) {
            await sendSignedDocumentEmail(
              s.signerEmail,
              s.signerName || 'there',
              document.originalName,
              signedFilePath,
              'signer',
            );
          }
        }
      }
    } else if (sender?.email) {
      await sendPartialSigningNotificationEmail(
        sender.email,
        sender.fullName,
        document.originalName,
        payload.signerName,
        signedCount,
        totalSigners,
      );
    }
  } catch (error) {
    console.error('Failed to send signed document emails:', error);
    emailWarning =
      'Document signed successfully but email notification failed to send. Check server log for more details';
  }

  return {
    signature: signatureRecord,
    ...(emailWarning && { warning: emailWarning }),
  };
};

export const SignatureService = {
  submitSignatureIntoDB,
};
