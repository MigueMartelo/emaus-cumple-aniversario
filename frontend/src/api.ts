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

export function createPerson(payload: FormValues): Promise<{ person: Person }> {
  const formData = new FormData();
  formData.append('firstName', payload.firstName);
  formData.append('lastName', payload.lastName);
  formData.append('dateOfBirth', payload.dateOfBirth);
  formData.append('anniversaryDate', payload.anniversaryDate);

  const photo = payload.photo?.[0];
  if (photo) {
    formData.append('photo', photo);
  }

  return request<{ person: Person }>('/api/people', {
    method: 'POST',
    body: formData,
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

export function getMediaUrl(path: string): string {
  return path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
}
