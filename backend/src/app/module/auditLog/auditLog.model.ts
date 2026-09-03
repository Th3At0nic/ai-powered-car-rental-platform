import mongoose, { Schema } from 'mongoose';
import { TAuditLog } from './auditLog.interface';

const AuditLogSchema = new Schema<TAuditLog>(
  {
    documentId: {
      type: String,
    },
    signRequestId: {
      type: String,
    },
    actorId: {
      type: String,
    },
    actorRole: {
      type: String,
      enum: ['sender', 'signer', 'system'],
    },
    action: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    gpsLatitude: {
      type: Number,
    },
    gpsLongitude: {
      type: Number,
    },
  },
  { timestamps: true },
);

export const AuditLogModel = mongoose.model<TAuditLog>(
  'AuditLog',
  AuditLogSchema,
);
