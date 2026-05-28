import { v2 as cloudinary } from 'cloudinary';
import { config } from './config.js';

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

export async function uploadImage(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'emaus-parejas',
        resource_type: 'image',
        transformation: [{ width: 600, height: 600, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Error al subir la imagen a Cloudinary.'));
        } else {
          resolve(result.secure_url);
        }
      },
    );

    stream.end(buffer);
  });
}
