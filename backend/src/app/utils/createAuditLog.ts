/* eslint-disable no-console */
import { AuditLogModel } from '../module/auditLog/auditLog.model';

type TAuditLogPayload = {
  documentId?: string;
  signRequestId?: string;
  actorId?: string;
  actorRole?: 'sender' | 'signer' | 'system';
  action: string;
  description?: string;
  ipAddress?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  metadata?: Record<string, unknown>;
};

export const createAuditLog = async (
  payload: TAuditLogPayload,
): Promise<void> => {
  try {
    await AuditLogModel.create(payload);
  } catch (error) {
    console.error('Audit log creation failed:', error);
  }
};
