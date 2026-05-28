import multer from 'multer';

const allowedMimetypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

class FileTypeError extends Error {
  readonly code = 'INVALID_FILE_TYPE';
  constructor() {
    super('Solo se permiten fotos JPG, PNG, WebP o GIF.');
  }
}

export const uploadPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    if (!allowedMimetypes.has(file.mimetype)) {
      callback(new FileTypeError());
      return;
    }
    callback(null, true);
  },
});
