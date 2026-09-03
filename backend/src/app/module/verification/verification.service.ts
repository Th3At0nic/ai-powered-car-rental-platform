import axios from 'axios';
import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import config from '../../config';
import throwAppError from '../../utils/throwAppError';
import { UserModel } from '../user/user.model';
import { createAuditLog } from '../../utils/createAuditLog';
import { TDiditWebhookPayload } from './verification.interface';

const getExpiryFromDecision = (decision?: Record<string, unknown>) => {
  if (!decision) {
    return null;
  }

  const expiryValue =
    typeof decision.expiresAt === 'string'
      ? decision.expiresAt
      : typeof decision.expires_at === 'string'
        ? decision.expires_at
        : typeof decision.valid_until === 'string'
          ? decision.valid_until
          : null;

  if (!expiryValue) {
    return null;
  }

  const expiryDate = new Date(expiryValue);

  return Number.isNaN(expiryDate.getTime()) ? null : expiryDate;
};

const startDiditVerification = async (
  userId: string,
  platform: 'ios' | 'android',
) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    return throwAppError('userId', 'User not found', StatusCodes.NOT_FOUND);
  }

  if (
    user.diditVerified === true &&
    user.diditVerificationExpiresAt &&
    user.diditVerificationExpiresAt > new Date()
  ) {
    return {
      alreadyVerified: true,
      expiresAt: user.diditVerificationExpiresAt,
    };
  }

  const response = await axios.post(
    'https://verification.didit.me/v3/session/',
    {
      workflow_id: config.diditWorkflowId,
      vendor_data: userId,
      callback: `${config.url.frontend_url}/verification/complete`,
      language: 'en',
      metadata: { platform, signbigbang_user_id: userId },
    },
    {
      headers: {
        'x-api-key': config.diditApiKey,
        'Content-Type': 'application/json',
      },
    },
  );

  const diditResponse = response.data as {
    session_id: string;
    session_token: string;
    url: string;
    status: string;
  };

  await UserModel.findByIdAndUpdate(userId, {
    $set: {
      diditSessionId: diditResponse.session_id,
      diditVerificationStatus: 'pending',
      diditPlatform: platform,
      diditVerified: false,
      diditVerifiedAt: null,
      diditVerificationExpiresAt: null,
      diditVerificationResult: null,
    },
  });

  /////////// PLEASE READ THE BELOW COMMENTS --- its CRITICAL ------//////////////

  // below Audit log is intentionally called without try/catch.

  // createAuditLog() handles its own errors internally and never throws.

  // If logging fails, it silently console.errors and returns — the main flow is never blocked.

  // DO NOT wrap this in try/catch or move it before DB operations.

  // Audit logging is non-critical — it must never affect the core business logic.

  await createAuditLog({
    actorId: userId,
    actorRole: 'signer',
    action: 'didit_session_created',
    description: `DiDIT verification session created on ${platform}`,
  });

  return {
    sessionId: diditResponse.session_id,
    sessionToken: diditResponse.session_token,
    verificationUrl: diditResponse.url,
    status: diditResponse.status,
  };
};

// Helper to generate canonical JSON string (sorted keys)
const getCanonicalJson = (obj: Record<string, unknown>): string => {
  if (!obj || typeof obj !== 'object') return '';
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    sortedObj[key] = obj[key];
  }
  return JSON.stringify(sortedObj);
};

const handleDiditWebhook = async (
  rawBody: Buffer,
  signature: string,
  timestamp: string,
  payload: TDiditWebhookPayload,
) => {
  // Guard against missing signature header to prevent ERR_INVALID_ARG_TYPE
  if (!signature) {
    throwAppError(
      'webhook',
      'Missing webhook signature header',
      StatusCodes.UNAUTHORIZED,
    );
  }

  // Validate timestamp to prevent replay attacks
  if (!timestamp) {
    return throwAppError(
      'webhook',
      'Missing webhook timestamp',
      StatusCodes.UNAUTHORIZED,
    );
  }

  const parsedTimestamp = parseInt(timestamp, 10);

  if (isNaN(parsedTimestamp)) {
    return throwAppError(
      'webhook',
      'Invalid webhook timestamp format',
      StatusCodes.UNAUTHORIZED,
    );
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const timeDifference = Math.abs(currentTime - parsedTimestamp);

  if (timeDifference > 300) {
    return throwAppError(
      'webhook',
      `Webhook timestamp outside allowed 300-second window. Difference: ${timeDifference}s`,
      StatusCodes.UNAUTHORIZED,
    );
  }

  const payloadString = rawBody.toString('utf8');
  const secret = config.diditWebhookSecret as string;
  let isValid = false;

  // 1. Primary check: X-Signature-V2 (HMAC over canonical sorted JSON)
  try {
    const canonicalPayload = getCanonicalJson(
      payload as Record<string, unknown>,
    );
    const expectedSigV2 = crypto
      .createHmac('sha256', secret)
      .update(canonicalPayload)
      .digest('hex');

    const sigBuf = Buffer.from(signature, 'hex');
    const expectedBuf = Buffer.from(expectedSigV2, 'hex');

    if (
      sigBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(sigBuf, expectedBuf)
    ) {
      isValid = true;
    }
  } catch {
    isValid = false;
  }

  // 2. Fallback check: Raw body HMAC (X-Signature)
  if (!isValid) {
    try {
      const expectedSigRaw = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      const sigBuf = Buffer.from(signature, 'hex');
      const expectedBuf = Buffer.from(expectedSigRaw, 'hex');

      if (
        sigBuf.length === expectedBuf.length &&
        crypto.timingSafeEqual(sigBuf, expectedBuf)
      ) {
        isValid = true;
      }
    } catch {
      isValid = false;
    }
  }

  // 3. Fallback check: Timestamped payload (timestamp.rawBody)
  if (!isValid) {
    try {
      const expectedSigTs = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}.${payloadString}`)
        .digest('hex');

      const sigBuf = Buffer.from(signature, 'hex');
      const expectedBuf = Buffer.from(expectedSigTs, 'hex');

      if (
        sigBuf.length === expectedBuf.length &&
        crypto.timingSafeEqual(sigBuf, expectedBuf)
      ) {
        isValid = true;
      }
    } catch {
      isValid = false;
    }
  }

  if (!isValid) {
    throwAppError(
      'webhook',
      'Invalid webhook signature',
      StatusCodes.UNAUTHORIZED,
    );
  }

  // Proceed with DB lookup and status updates...
  const user = await UserModel.findOne({
    $or: [
      ...(payload.session_id ? [{ diditSessionId: payload.session_id }] : []),
      ...(payload.vendor_data ? [{ _id: payload.vendor_data }] : []),
    ],
  });

  if (!user) {
    return throwAppError(
      'userId',
      'User not found for this session',
      StatusCodes.NOT_FOUND,
    );
  }

  const diditVerificationStatusMap: Record<
    string,
    'not_started' | 'pending' | 'approved' | 'declined' | 'in_review'
  > = {
    Approved: 'approved',
    Declined: 'declined',
    'In Review': 'in_review',
    'In Progress': 'pending',
    'Not Started': 'not_started',
    Abandoned: 'not_started',
    Expired: 'not_started',
  };

  const diditVerificationStatus =
    diditVerificationStatusMap[payload.status] || 'not_started';
  const approvedAt = payload.status === 'Approved' ? new Date() : null;
  const expiryDate =
    payload.status === 'Approved'
      ? (getExpiryFromDecision(payload.decision ?? undefined) ??
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
      : null;

  await UserModel.findByIdAndUpdate(user._id, {
    $set: {
      ...(payload.session_id && { diditSessionId: payload.session_id }),
      diditVerificationStatus,
      diditVerificationResult: payload.decision ?? null,
      diditVerified: payload.status === 'Approved',
      diditVerifiedAt: approvedAt,
      diditVerificationExpiresAt: expiryDate,
    },
  });

  await createAuditLog({
    actorId: String(user._id),
    actorRole: 'signer',
    action: `didit_verification_${payload.status.toLowerCase().replace(/\s+/g, '_')}`,
    description: `DiDIT verification ${payload.status} for ${user.email}`,
    metadata: {
      sessionId: payload.session_id,
      platform: user.diditPlatform,
      signerEmail: user.email,
      status: payload.status,
    },
  });

  return { received: true };
};

const getDiditVerificationStatus = async (userId: string) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    return throwAppError('userId', 'User not found', StatusCodes.NOT_FOUND);
  }

  const isExpired = user.diditVerificationExpiresAt
    ? user.diditVerificationExpiresAt < new Date()
    : true;

  return {
    diditVerified: user.diditVerified && !isExpired,
    verificationStatus: user.diditVerificationStatus,
    verifiedAt: user.diditVerifiedAt,
    expiresAt: user.diditVerificationExpiresAt,
    platform: user.diditPlatform,
    isExpired,
    requiresReverification: !user.diditVerified || isExpired,
  };
};

export const VerificationService = {
  startDiditVerification,
  handleDiditWebhook,
  getDiditVerificationStatus,
};
