import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(backendRoot, '.env') });

export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL,
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  appTimeZone: process.env.APP_TIME_ZONE ?? 'America/Bogota',
  adminToken: process.env.ADMIN_TOKEN,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET ?? 'emaus_signed',
};

export function requireConfig(): void {
  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL es obligatorio. Copia backend/.env.example a backend/.env y actualízalo si hace falta.');
  }

  if (!config.adminToken) {
    throw new Error('ADMIN_TOKEN es obligatorio. Define un token privado en backend/.env.');
  }

  if (!config.cloudinaryCloudName || !config.cloudinaryApiKey || !config.cloudinaryApiSecret) {
    throw new Error('CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET son obligatorios.');
  }
}
