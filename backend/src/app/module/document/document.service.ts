import { StatusCodes } from 'http-status-codes';
import throwAppError from '../../utils/throwAppError';
import fs from 'fs';
import crypto from 'crypto';
import { DocumentModel } from './document.model';
import { TDocument, TUploadPayload } from './document.interface';
import { createAuditLog } from '../../utils/createAuditLog';

const uploadPdfToDB = async (payload: TUploadPayload) => {
  if (!payload || !payload.userId || !payload.file || !payload.fileUrl) {
    throwAppError(
      '',
      'Something went wrong while uploading the document. Try again.',
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  const { userId, file, fileUrl } = payload;

  // Read first 4 bytes and verify PDF magic signature
  const fileBuffer = fs.readFileSync(file.path);
  const magicBytes = fileBuffer.subarray(0, 4);
  if (!magicBytes.equals(Buffer.from('%PDF'))) {
    // Delete the already-saved fake file
    fs.unlinkSync(file.path);
    return throwAppError(
      'file',
      'Invalid file content. The uploaded file is not a valid PDF.',
      StatusCodes.BAD_REQUEST,
    );
  }

  // Read file from disk and compute sha256 hash
  let hash: string = '';
  try {
    const buffer = fs.readFileSync(file.path);
    hash = crypto.createHash('sha256').update(buffer).digest('hex');
  } catch {
    throwAppError(
      'file',
      "Couldn't read uploaded file from disk.",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  const docPayload: Partial<TDocument> = {
    senderId: userId,
    originalName: file.originalname,
    fileName: file.filename,
    filePath: file.path,
    fileUrl,
    mimeType: file.mimetype,
    fileSize: file.size,
    originalHash: hash,
    status: 'uploaded' as const,
  };

  const created = await DocumentModel.create(docPayload as TDocument);

  if (!created) {
    throwAppError(
      '',
      "Something went wrong. Couldn't save document. Try again.",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  /////////// PLEASE READ THE BELOW COMMENTS --- its CRITICAL ------//////////////

  // below Audit log is intentionally called without try/catch.

  // createAuditLog() handles its own errors internally and never throws.

  // If logging fails, it silently console.errors and returns — the main flow is never blocked.

  // DO NOT wrap this in try/catch or move it before DB operations.

  // Audit logging is non-critical — it must never affect the core business logic.

  await createAuditLog({
    documentId: String(created._id),
    actorId: userId,
    actorRole: 'sender',
    action: 'document_uploaded',
    description: `Document ${file.originalname} uploaded successfully`,
  });

  return created;
};

export const DocumentService = {
  uploadPdfToDB,
};
