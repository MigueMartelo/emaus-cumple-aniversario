import type { FormValues, Person, TodayCelebrationsData } from './types.ts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  errors: Record<string, string>;

  constructor(message: string, errors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.errors = errors;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  const contentType = response.headers.get('content-type') ?? '';
  const data: { message?: string; errors?: Record<string, string> } & T =
    contentType.includes('application/json') ? await response.json() : {};

  if (!response.ok) {
    throw new ApiError(data.message ?? 'La solicitud falló.', data.errors ?? {});
  }

  return data;
}

interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  uploadPreset: string;
  signature: string;
}

async function uploadPhotoToCloudinary(file: File): Promise<string> {
  const { cloudName, apiKey, timestamp, uploadPreset, signature } =
    await request<UploadSignature>('/api/uploads/signature');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('upload_preset', uploadPreset);
  formData.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = (await response.json()) as { secure_url?: string; error?: { message: string } };

  if (!response.ok || !data.secure_url) {
    throw new ApiError(data.error?.message ?? 'No se pudo subir la foto.');
  }

  return data.secure_url;
}

export async function createPerson(payload: FormValues): Promise<{ person: Person }> {
  const photo = payload.photo?.[0];
  let photoUrl: string | null = null;

  if (photo) {
    photoUrl = await uploadPhotoToCloudinary(photo);
  }

  return request<{ person: Person }>('/api/people', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      firstName: payload.firstName,
      lastName: payload.lastName,
      dateOfBirth: payload.dateOfBirth,
      anniversaryDate: payload.anniversaryDate,
      photoUrl,
    }),
  });
}

function adminHeaders(adminToken: string): Record<string, string> {
  return adminToken ? { 'x-admin-token': adminToken } : {};
}

export function getTodayCelebrations(adminToken: string): Promise<TodayCelebrationsData> {
  return request<TodayCelebrationsData>('/api/celebrations/today', {
    headers: adminHeaders(adminToken),
  });
}

export function listPeople(adminToken: string): Promise<{ people: Person[] }> {
  return request<{ people: Person[] }>('/api/people', {
    headers: adminHeaders(adminToken),
  });
}

export function updatePerson(
  adminToken: string,
  id: number,
  payload: { firstName: string; lastName: string; dateOfBirth: string; anniversaryDate: string },
): Promise<{ person: Person }> {
  return request<{ person: Person }>(`/api/people/${id}`, {
    method: 'PATCH',
    headers: { ...adminHeaders(adminToken), 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function setPersonActive(adminToken: string, id: number, active: boolean): Promise<{ person: Person }> {
  return request<{ person: Person }>(`/api/people/${id}/active`, {
    method: 'PATCH',
    headers: { ...adminHeaders(adminToken), 'content-type': 'application/json' },
    body: JSON.stringify({ active }),
  });
}

export function setPersonSpouse(adminToken: string, id: number, spouseId: number | null): Promise<{ person: Person }> {
  return request<{ person: Person }>(`/api/people/${id}/spouse`, {
    method: 'PATCH',
    headers: { ...adminHeaders(adminToken), 'content-type': 'application/json' },
    body: JSON.stringify({ spouseId }),
  });
}

export function getMediaUrl(path: string): string {
  return path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
}
