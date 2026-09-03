export type TSignature = {
  documentId: string;
  signRequestId: string;
  signerId?: string;
  signerName: string;
  signerEmail: string;
  signatureImage: string;
  signedPdfPath: string;
  signedPdfUrl?: string;
  ipAddress: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  signedAt: Date;
  consentGiven: boolean; // proof they agreed
  consentGivenAt: Date; // exactly when they agreed
  userAgent?: string; // Browser/device information for audit trail
};

export type TSubmitSignaturePayload = {
  signatureImage: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  signerName: string;
  signerEmail: string;
  consentGiven: boolean;
};
