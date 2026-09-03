import mongoose, { Schema } from 'mongoose';
import { TDocument } from './document.interface';

const DocumentSchema = new Schema<TDocument>(
  {
    senderId: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
    },
    originalHash: {
      type: String,
      required: true,
    },
    signedFilePath: {
      type: String,
    },
    signedFileUrl: {
      type: String,
    },
    signedHash: {
      type: String,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['uploaded', 'pending', 'signed', 'completed'],
      default: 'uploaded',
    },
    signedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const DocumentModel = mongoose.model<TDocument>(
  'Document',
  DocumentSchema,
);
