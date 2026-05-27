import { existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

const dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.join(dirname, '..', 'uploads');

mkdirSync(uploadsDir, { recursive: true });

const allowedExtensions = new Map<string, string>([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
]);

class FileTypeError extends Error {
  readonly code = 'INVALID_FILE_TYPE';
  constructor() {
    super('Solo se permiten fotos JPG, PNG, WebP o GIF.');
  }
}

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, uploadsDir);
  },
  filename: (_request, file, callback) => {
    const extension = allowedExtensions.get(file.mimetype) ?? '.bin';
    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
  },
});

export const uploadPhoto = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    if (!allowedExtensions.has(file.mimetype)) {
      callback(new FileTypeError());
      return;
    }
    callback(null, true);
  },
});

export function photoUrlFromFile(file: Express.Multer.File | undefined): string | null {
  return file ? `/uploads/${file.filename}` : null;
}

export function deleteUploadedFile(file: Express.Multer.File | undefined): void {
  if (!file?.path || !existsSync(file.path)) return;
  unlinkSync(file.path);
}
