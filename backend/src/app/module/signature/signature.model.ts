import mongoose, { Schema } from 'mongoose';
import { TSignature } from './signature.interface';

const SignatureSchema = new Schema<TSignature>(
  {
    documentId: {
      type: String,
      required: true,
    },
    signRequestId: {
      type: String,
      required: true,
    },
    signerId: {
      type: String,
    },
    signerName: {
      type: String,
      required: true,
    },
    signerEmail: {
      type: String,
      required: true,
    },
    signatureImage: {
      type: String,
      required: true,
    },
    signedPdfPath: {
      type: String,
      required: true,
    },
    signedPdfUrl: {
      type: String,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    gpsLatitude: {
      type: Number,
    },
    gpsLongitude: {
      type: Number,
    },
    signedAt: {
      type: Date,
      default: Date.now,
    },
    consentGiven: {
      type: Boolean, // proof they agreed
      required: true,
    },
    consentGivenAt: {
      type: Date,
      default: Date.now, // exactly when they agreed
    },
    userAgent: { type: String, default: 'Unknown' }, // Browser/device information for audit trail
  },
  { timestamps: true },
);

export const SignatureModel = mongoose.model<TSignature>(
  'Signature',
  SignatureSchema,
);
