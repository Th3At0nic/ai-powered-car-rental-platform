import { StatusCodes } from 'http-status-codes';
import { AuditLogModel } from '../auditLog/auditLog.model';
import { DocumentModel } from '../document/document.model';
import { SignRequestModel } from '../signRequest/signRequest.model';
import { SignatureModel } from '../signature/signature.model';
import { UserModel } from '../user/user.model';
import throwAppError from '../../utils/throwAppError';

type TAuditTrailEvent = {
  action: string;
  label: string;
  timestamp: Date | null;
  status: 'completed' | 'pending';
  description: string;
};

const buildAuditTrail = (
  document: {
    createdAt?: Date;
    status: string;
    completedAt?: Date | null;
  },
  signRequest: {
    requireIdCheck?: boolean;
    smsVerificationMode?: 'none' | 'all' | 'individual';
    sentAt?: Date | null;
    signers: Array<{
      signerName?: string;
      signerEmail: string;
      requireSms?: boolean;
      smsVerified?: boolean;
      smsVerifiedAt?: Date | null;
      signedAt?: Date | null;
      status: 'pending' | 'signed' | 'expired' | 'revoked';
    }>;
  } | null,
  auditLogs: Array<{
    action: string;
    description?: string;
    createdAt?: Date;
  }>,
  signatures: Array<unknown>,
): TAuditTrailEvent[] => {
  void signatures;

  const events: TAuditTrailEvent[] = [
    {
      action: 'document_uploaded',
      label: 'Uploaded',
      timestamp: document.createdAt ?? null,
      status: 'completed',
      description: 'Document uploaded successfully',
    },
    {
      action: 'sign_request_created',
      label: 'Sign Request Sent',
      timestamp: signRequest?.sentAt ?? null,
      status: signRequest ? 'completed' : 'pending',
      description: signRequest
        ? `Sign request sent to ${signRequest.signers.length} signer(s)`
        : 'Sign request not yet created',
    },
  ];

  if (signRequest) {
    signRequest.signers.forEach((signer) => {
      if (signRequest.requireIdCheck) {
        const identityAuditLog = auditLogs.find(
          (log) =>
            log.action.includes('didit_verification_approved') &&
            (log.description ?? '').includes(signer.signerEmail),
        );

        events.push({
          action: 'identity_verified',
          label: `Identity Verified — ${signer.signerName || signer.signerEmail}`,
          timestamp: identityAuditLog?.createdAt ?? null,
          status: signer.smsVerified ? 'completed' : 'pending',
          description: 'DiDIT identity verification',
        });
      }

      if (
        signRequest.smsVerificationMode !== 'none' &&
        (signer.requireSms || signRequest.smsVerificationMode === 'all')
      ) {
        events.push({
          action: 'sms_verified',
          label: `SMS Verified — ${signer.signerName || signer.signerEmail}`,
          timestamp: signer.smsVerifiedAt ?? null,
          status: signer.smsVerified ? 'completed' : 'pending',
          description: 'Phone number verified via SMS OTP',
        });
      }

      events.push({
        action: 'document_signed',
        label: `Signed — ${signer.signerName || signer.signerEmail}`,
        timestamp: signer.signedAt ?? null,
        status: signer.status === 'signed' ? 'completed' : 'pending',
        description:
          signer.status === 'signed'
            ? `Document signed by ${signer.signerName || signer.signerEmail}`
            : 'Awaiting signature',
      });
    });
  }

  events.push({
    action: 'certificate_issued',
    label: 'Certificate Issued',
    timestamp: document.completedAt ?? null,
    status: document.status === 'completed' ? 'completed' : 'pending',
    description:
      document.status === 'completed'
        ? 'All parties signed. Final signed document available.'
        : 'Pending all signatures',
  });

  return events;
};

const getSenderDashboardFromDB = async (senderId: string) => {
  const documents = await DocumentModel.find({ senderId }).select('-__v');

  const result = await Promise.all(
    documents.map(async (document) => {
      const signRequest = await SignRequestModel.findOne({
        documentId: document._id,
      }).select('status signers sentAt completedAt');

      return {
        ...document.toObject(),
        signRequest: signRequest
          ? {
              sentAt: signRequest.sentAt,
              completedAt: signRequest.completedAt,
              overallStatus: signRequest.status,
              totalSigners: signRequest.signers.length,
              signedCount: signRequest.signers.filter(
                (s) => s.status === 'signed',
              ).length,
              signers: signRequest.signers.map((s) => ({
                signerName: s.signerName,
                signerEmail: s.signerEmail,
                status: s.status,
                signedAt: s.signedAt,
              })),
            }
          : null,
      };
    }),
  );

  return result;
};

const getSignerDashboardFromDB = async (signerEmail: string) => {
  const signRequests = await SignRequestModel.find({
    'signers.signerEmail': signerEmail,
  });

  const documentIds = signRequests.map((sr) => sr.documentId);
  const documents = await DocumentModel.find({
    _id: { $in: documentIds },
  }).select('originalName fileSize mimeType status fileUrl signedFileUrl');

  const documentMap = new Map(documents.map((doc) => [String(doc._id), doc]));

  // Pre-compute mySigner for each signRequest once — avoids duplicate .find() calls
  const enriched = signRequests.map((sr) => {
    const mySigner = sr.signers.find((s) => s.signerEmail === signerEmail);

    const doc = documentMap.get(String(sr.documentId));
    return {
      signRequestId: sr._id,
      documentId: sr.documentId,
      overallStatus: sr.status,
      myStatus: mySigner?.status,
      token: mySigner?.token,
      tokenExpiresAt: mySigner?.tokenExpiresAt,
      signedAt: mySigner?.signedAt,
      sentAt: sr.sentAt,
      totalSigners: sr.signers.length,
      signedCount: sr.signers.filter((s) => s.status === 'signed').length,
      document: doc
        ? {
            originalName: doc.originalName,
            fileSize: doc.fileSize,
            mimeType: doc.mimeType,
            status: doc.status,
            fileUrl: doc.fileUrl,
            signedFileUrl: doc.signedFileUrl,
          }
        : null,
    };
  });

  // Now group by THIS signer's own status — no repeated .find() calls
  const pending = enriched.filter((item) => item.myStatus === 'pending');
  const signed = enriched.filter((item) => item.myStatus === 'signed');
  const expired = enriched.filter(
    (item) => item.myStatus === 'expired' || item.myStatus === 'revoked',
  );

  return { pending, signed, expired };
};

const getDocumentDetailFromDB = async (
  userId: string,
  userRole: string,
  documentId: string,
) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    return throwAppError('userId', 'User not found', StatusCodes.NOT_FOUND);
  }

  const document = await DocumentModel.findById(documentId);

  if (!document) {
    return throwAppError(
      'documentId',
      'Document not found',
      StatusCodes.NOT_FOUND,
    );
  }

  const signRequest =
    userRole === 'sender'
      ? await SignRequestModel.findOne({ documentId })
      : await SignRequestModel.findOne({
          documentId,
          'signers.signerEmail': user.email,
        });

  if (userRole === 'sender') {
    if (String(document.senderId) !== String(userId)) {
      return throwAppError(
        'authorization',
        'You are not authorized to view this document',
        StatusCodes.FORBIDDEN,
      );
    }
  } else if (!signRequest) {
    return throwAppError(
      'authorization',
      'You are not authorized to view this document',
      StatusCodes.FORBIDDEN,
    );
  }

  const signatures = await SignatureModel.find({ documentId });
  const auditLogs = await AuditLogModel.find({ documentId }).sort({
    createdAt: 1,
  });

  const result = {
    documentInfo: {
      documentName: document.originalName,
      referenceId: String(document._id).slice(-8).toUpperCase(),
      date: document.createdAt,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      pages: null,
      status: document.status,
      signatureType: signRequest?.requireIdCheck ? 'Qualified' : 'Standard',
      verificationMode: signRequest?.smsVerificationMode ?? 'none',
      totalSigners: signRequest?.signers.length ?? 0,
      signedCount:
        signRequest?.signers.filter((s) => s.status === 'signed').length ?? 0,
      fileUrl: document.fileUrl,
      signedFileUrl: document.signedFileUrl ?? null,
    },
    signers:
      signRequest?.signers.map((s) => ({
        signerName: s.signerName,
        signerEmail: s.signerEmail,
        status: s.status,
        signedAt: s.signedAt ?? null,
        smsVerified: s.smsVerified ?? false,
        smsVerifiedAt: s.smsVerifiedAt ?? null,
      })) ?? [],
    auditTrail: buildAuditTrail(document, signRequest, auditLogs, signatures),
  };

  return result;
};

export const DashboardService = {
  getSenderDashboardFromDB,
  getSignerDashboardFromDB,
  getDocumentDetailFromDB,
};
