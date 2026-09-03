import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), '/uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname) || '.pdf';
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = path.extname(file.originalname).toLowerCase() === '.pdf';

  if (!isPdfMime || !isPdfExt) {
    return cb(
      new Error(
        'Only PDF files are allowed. Please upload a valid PDF document.',
      ),
    );
  }

  // We pass here — magic byte check happens in the service after file is buffered
  cb(null, true);
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});
