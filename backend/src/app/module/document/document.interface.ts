export type TDocumentStatus = 'uploaded' | 'pending' | 'signed' | 'completed';

export type TDocument = {
  senderId: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileUrl?: string;
  originalHash: string;
  signedFilePath?: string;
  signedFileUrl?: string;
  signedHash?: string;
  mimeType: string;
  fileSize: number;
  status: TDocumentStatus;
  signedAt?: Date;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TUploadPayload = {
  userId: string;
  file: Express.Multer.File;
  fileUrl: string;
};
