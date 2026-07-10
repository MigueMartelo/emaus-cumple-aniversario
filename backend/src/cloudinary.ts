import { v2 as cloudinary } from 'cloudinary';
import { config } from './config.js';

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  uploadPreset: string;
  signature: string;
}

export function createUploadSignature(): UploadSignature {
  const timestamp = Math.round(Date.now() / 1000);
  const uploadPreset = config.cloudinaryUploadPreset;
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, upload_preset: uploadPreset },
    config.cloudinaryApiSecret!,
  );

  return {
    cloudName: config.cloudinaryCloudName!,
    apiKey: config.cloudinaryApiKey!,
    timestamp,
    uploadPreset,
    signature,
  };
}
