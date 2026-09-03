export type TAuditLog = {
  documentId?: string;
  signRequestId?: string;
  actorId?: string;
  actorRole?: 'sender' | 'signer' | 'system';
  action: string;
  description?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
};
