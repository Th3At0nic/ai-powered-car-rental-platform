import mongoose, { Schema } from 'mongoose';
import { TSignRequest } from './signRequest.interface';

const SignatureFieldPositionSchema = new Schema(
  {
    page: {
      type: Number,
      required: true,
    },
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const SignerSchema = new Schema(
  {
    signerEmail: {
      type: String,
      required: true,
    },
    signerPhone: {
      type: String,
      default: null,
    },
    smsOtp: {
      type: String,
      default: null,
    },
    smsOtpExpiresAt: {
      type: Date,
      default: null,
    },
    smsVerified: {
      type: Boolean,
      default: false,
    },
    requireSms: {
      type: Boolean,
      default: false,
    },
    smsFailedAttempts: {
      type: Number,
      default: 0,
    },
    smsSentAt: {
      type: Date,
      default: null,
    },
    smsVerifiedAt: {
      type: Date,
      default: null,
    },
    signerName: {
      type: String,
    },
    token: {
      type: String,
      required: true,
    },
    tokenExpiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'signed', 'expired', 'revoked'],
      default: 'pending',
    },
    signatureFieldPosition: {
      type: SignatureFieldPositionSchema,
      required: true,
    },
    sentAt: {
      type: Date,
    },
    signedAt: {
      type: Date,
    },
  },
  { _id: false },
);

const SignRequestSchema = new Schema<TSignRequest>(
  {
    documentId: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'partially_signed', 'completed', 'expired', 'revoked'],
      default: 'pending',
    },
    signers: {
      type: [SignerSchema],
      required: true,
    },
    sentAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    smsVerificationMode: {
      type: String,
      enum: ['none', 'all', 'individual'],
      default: 'none',
    },
    requireLivenessCheck: { type: Boolean, default: false },
    requireIdCheck: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const SignRequestModel = mongoose.model<TSignRequest>(
  'SignRequest',
  SignRequestSchema,
);
