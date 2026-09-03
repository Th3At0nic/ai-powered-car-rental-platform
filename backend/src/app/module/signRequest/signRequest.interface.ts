export type TSignRequestStatus =
  | 'pending'
  | 'partially_signed'
  | 'completed'
  | 'expired'
  | 'revoked';

export type TSignatureFieldPosition = {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TSigner = {
  signerEmail: string;
  signerPhone?: string;
  smsOtp?: string;
  smsOtpExpiresAt?: Date;
  smsVerified?: boolean;
  requireSms?: boolean;
  smsFailedAttempts?: number;
  smsSentAt?: Date;
  smsVerifiedAt?: Date;
  signerName?: string;
  token: string;
  tokenExpiresAt: Date;
  status: 'pending' | 'signed' | 'expired' | 'revoked';
  signatureFieldPosition: TSignatureFieldPosition;
  sentAt?: Date;
  signedAt?: Date;
};

export type TSignRequest = {
  documentId: string;
  senderId: string;
  status: TSignRequestStatus;
  signers: TSigner[];
  sentAt?: Date;
  completedAt?: Date;
  // Add to SignRequest model — the flags only, no enforcement logic yet
  smsVerificationMode: 'none' | 'all' | 'individual';
  requireLivenessCheck?: boolean;
  requireIdCheck?: boolean;
};

export type TCreateSignRequestPayload = {
  documentId: string;
  signers: {
    signerEmail: string;
    signerPhone?: string;
    requireSms?: boolean;
    signerName?: string;
    signatureFieldPosition: TSignatureFieldPosition;
  }[];
  smsVerificationMode?: 'none' | 'all' | 'individual';
  requireLivenessCheck?: boolean;
  requireIdCheck?: boolean;
};
