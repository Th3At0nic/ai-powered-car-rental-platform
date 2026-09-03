import { StatusCodes } from 'http-status-codes';
import crypto from 'crypto';
import throwAppError from '../../utils/throwAppError';
import { DocumentModel } from '../document/document.model';
import { SignRequestModel } from './signRequest.model';
import { TCreateSignRequestPayload as TCreateSignRequestPayload } from './signRequest.interface';
import config from '../../config';
import { sendSignRequestEmail } from '../../utils/sendEmail';
import { createAuditLog } from '../../utils/createAuditLog';
import { sendSmsWithGateWayApi } from '../../utils/sendSmsWithGateWayApi';
import { generateOTP } from '../../utils/generateOTP';

const createSignRequestIntoDB = async (
  senderId: string,
  payload: TCreateSignRequestPayload,
) => {
  const document = await DocumentModel.findById(payload.documentId);

  if (!document) {
    return throwAppError(
      'documentId',
      'Document not found',
      StatusCodes.NOT_FOUND,
    );
  }

  if (document.status === 'completed') {
    return throwAppError(
      'documentId',
      'This document has already been signed and completed. A new sign request cannot be created for it.',
      StatusCodes.BAD_REQUEST,
    );
  }

  if (document?.senderId !== senderId) {
    throwAppError(
      'senderId',
      'You are not the owner of this document',
      StatusCodes.FORBIDDEN,
    );
  }

  const existingPendingSignRequest = await SignRequestModel.findOne({
    documentId: payload.documentId,
    status: 'pending',
  });

  if (existingPendingSignRequest) {
    throwAppError(
      'documentId',
      'A pending sign request already exists for this document',
      StatusCodes.BAD_REQUEST,
    );
  }

  const signers = payload.signers.map((signer) => {
    const token = crypto.randomUUID();
    const tokenExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    return {
      signerEmail: signer.signerEmail,
      signerPhone: signer.signerPhone,
      requireSms: signer.requireSms ?? false,
      signerName: signer.signerName,
      token,
      tokenExpiresAt,
      signatureFieldPosition: signer.signatureFieldPosition,
      status: 'pending' as const,
      sentAt: new Date(),
    };
  });

  const smsVerificationMode = payload.smsVerificationMode ?? 'none';

  if (smsVerificationMode !== 'none') {
    const missingPhone = payload.signers.find((signer) => {
      const requiresPhone =
        smsVerificationMode === 'all' ||
        (smsVerificationMode === 'individual' && signer.requireSms === true);

      return requiresPhone && !signer.signerPhone;
    });

    if (missingPhone) {
      return throwAppError(
        'signerPhone',
        'Phone number is required for all signers when SMS verification is enabled',
        StatusCodes.BAD_REQUEST,
      );
    }
  }

  const signRequest = await SignRequestModel.create({
    documentId: payload.documentId,
    senderId,
    status: 'pending',
    sentAt: new Date(),
    signers,
    smsVerificationMode: payload.smsVerificationMode ?? 'none',
    requireLivenessCheck: payload.requireLivenessCheck ?? false,
    requireIdCheck: payload.requireIdCheck ?? false,
  });

  await DocumentModel.findByIdAndUpdate(payload.documentId, {
    status: 'pending',
  });

  //// this below part is responsible for sending email to the signer after the signRequest is created in the DB //////////////

  let warningMessage = '';
  try {
    for (const signer of signers) {
      const signingUrl = `${config.url.frontend_url}/sign/${signer.token}`;
      await sendSignRequestEmail(
        signer.signerEmail,
        signer.signerName || 'there',
        document!.originalName,
        signingUrl,
        signer.tokenExpiresAt,
      );
    }
  } catch {
    warningMessage =
      'SignRequest created in DB but Email delivery failed. Check server logs for more details.';
  }

  if (warningMessage) {
    return {
      ...signRequest.toObject(),
      warning: warningMessage.trim(),
    };
  }

  /////////// PLEASE READ THE BELOW COMMENTS --- its CRITICAL ------//////////////

  // below Audit log is intentionally called without try/catch.

  // createAuditLog() handles its own errors internally and never throws.

  // If logging fails, it silently console.errors and returns — the main flow is never blocked.

  // DO NOT wrap this in try/catch or move it before DB operations.

  // Audit logging is non-critical — it must never affect the core business logic.

  await createAuditLog({
    documentId: String(payload.documentId),
    signRequestId: String(signRequest._id),
    actorId: senderId,
    actorRole: 'sender',
    action: 'sign_request_created',
    description: `Sign request created and sent to ${payload.signers.length} signer(s)`,
  });

  return signRequest;
};

const validateSigningTokenFromDB = async (token: string) => {
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

  /////////// PLEASE READ THE BELOW COMMENTS --- its CRITICAL ------//////////////

  // below Audit log is intentionally called without try/catch.

  // createAuditLog() handles its own errors internally and never throws.

  // If logging fails, it silently console.errors and returns — the main flow is never blocked.

  // DO NOT wrap this in try/catch or move it before DB operations.

  // Audit logging is non-critical — it must never affect the core business logic.
  //

  const totalSigners = signRequest.signers.length;
  const signedCount = signRequest.signers.filter(
    (signerItem) => signerItem.status === 'signed',
  ).length;

  await createAuditLog({
    documentId: String(document._id),
    signRequestId: String(signRequest._id),
    actorRole: 'signer',
    action: 'document_viewed',
    description: 'Signer opened the signing link',
  });

  return {
    signRequestId: signRequest._id,
    documentId: document._id,
    documentName: document.originalName,
    fileUrl: document.fileUrl,
    signatureFieldPosition: signer.signatureFieldPosition,
    signerEmail: signer.signerEmail,
    signerName: signer.signerName,
    expiresAt: signer.tokenExpiresAt,
    totalSigners,
    signedCount,
    // optional validation data's are below
    smsVerificationMode: signRequest.smsVerificationMode,
    smsRequired:
      signRequest.smsVerificationMode === 'all' ||
      (signRequest.smsVerificationMode === 'individual' &&
        signer.requireSms === true),
    requireLivenessCheck: signRequest.requireLivenessCheck,
    requireIdCheck: signRequest.requireIdCheck,
  };
};

const sendSignerOtpBeforeSign = async (token: string) => {
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

  if (signer.status !== 'pending') {
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

  if (!smsRequired) {
    return throwAppError(
      'token',
      'SMS verification is not required for this signer',
      StatusCodes.BAD_REQUEST,
    );
  }

  if (!signer.signerPhone) {
    throwAppError(
      'signerPhone',
      'No phone number found for this signer',
      StatusCodes.BAD_REQUEST,
    );
  }

  const phone = signer.signerPhone!;

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  try {
    await sendSmsWithGateWayApi(
      phone,
      `Your SignBigBang signing code is: ${otp}. Valid for 10 minutes.`,
    );
  } catch {
    throwAppError(
      'sms',
      'Failed to send verification SMS',
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  await SignRequestModel.findOneAndUpdate(
    { 'signers.token': token },
    {
      $set: {
        'signers.$.smsOtp': otp,
        'signers.$.smsOtpExpiresAt': otpExpiry,
        'signers.$.smsVerified': false,
        'signers.$.smsFailedAttempts': 0,
        'signers.$.smsSentAt': new Date(),
      },
    },
  );

  return {
    message: 'OTP sent successfully',
    phone: phone.slice(-4).padStart(phone.length, '*'),
  };
};

const verifySignerOtpBeforeSign = async (token: string, otp: string) => {
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

  if (signer.smsOtp == null) {
    throwAppError(
      'smsOtp',
      'No OTP was sent. Please request a new code.',
      StatusCodes.BAD_REQUEST,
    );
  }

  // Check if already blocked BEFORE comparing
  if (signer.smsFailedAttempts && signer.smsFailedAttempts >= 3) {
    return throwAppError(
      'otp',
      'Too many failed attempts. Please request a new SMS code.',
      StatusCodes.TOO_MANY_REQUESTS,
    );
  }

  // Check OTP match
  if (signer.smsOtp !== otp) {
    await SignRequestModel.findOneAndUpdate(
      { 'signers.token': token },
      { $inc: { 'signers.$.smsFailedAttempts': 1 } },
    );

    // If now at limit, also clear the OTP to force resend
    if ((signer.smsFailedAttempts ?? 0) + 1 >= 3) {
      await SignRequestModel.findOneAndUpdate(
        { 'signers.token': token },
        {
          $set: {
            'signers.$.smsOtp': null,
            'signers.$.smsOtpExpiresAt': null,
          },
        },
      );
      return throwAppError(
        'otp',
        'Too many failed attempts. Your code has been invalidated. Please request a new SMS code.',
        StatusCodes.TOO_MANY_REQUESTS,
      );
    }

    return throwAppError(
      'otp',
      'Invalid OTP. Please try again.',
      StatusCodes.BAD_REQUEST,
    );
  }

  //these below code are the previous code, replaced with the new code block below this block
  // if (signer.smsOtp !== otp) {
  //   const failedAttempts = (signer.smsFailedAttempts ?? 0) + 1;

  //   await SignRequestModel.findOneAndUpdate(
  //     { 'signers.token': token },
  //     { $inc: { 'signers.$.smsFailedAttempts': 1 } },
  //   );

  //   if (failedAttempts >= 3) {
  //     throwAppError(
  //       'smsOtp',
  //       'Too many failed attempts. Please request a new OTP.',
  //       StatusCodes.BAD_REQUEST,
  //     );
  //   }

  //   throwAppError(
  //     'smsOtp',
  //     'Invalid OTP. Please try again.',
  //     StatusCodes.BAD_REQUEST,
  //   );
  // }

  if (signer.smsOtpExpiresAt && signer.smsOtpExpiresAt.getTime() < Date.now()) {
    throwAppError(
      'smsOtp',
      'OTP has expired. Please request a new code.',
      StatusCodes.BAD_REQUEST,
    );
  }

  await SignRequestModel.findOneAndUpdate(
    { 'signers.token': token },
    {
      $set: {
        'signers.$.smsVerified': true,
        'signers.$.smsOtp': null,
        'signers.$.smsOtpExpiresAt': null,
        'signers.$.smsVerifiedAt': new Date(),
      },
    },
  );

  return {
    message:
      'Phone number verified successfully. You may now sign the document.',
  };
};
export const SignRequestService = {
  createSignRequestIntoDB,
  validateSigningTokenFromDB,
  sendSignerOtpBeforeSign,
  verifySignerOtpBeforeSign,
};
