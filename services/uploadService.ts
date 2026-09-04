import { env } from '../config/env';
import { apiClient, createAppError, mockResponse } from './apiClient';

export interface UploadResult {
  url: string;
  public_id: string;
  resource_type: 'image' | 'raw';
}

export interface VerificationUploadResult extends UploadResult {
  document_id: string;
  verification_status: 'pending';
}

interface PublicUploadConfig {
  cloud_name: string;
  upload_url: string;
  unsigned_upload_preset: string;
}

interface SignedUploadConfig {
  cloud_name: string;
  upload_url: string;
  api_key: string;
  signature: string;
  timestamp: number;
  folder: string;
}

const MOCK_UPLOAD_DELAY_MS = Math.min(env.MOCK_LATENCY_MS, 600);

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('File tidak dapat dibaca.'));
    reader.onerror = () => reject(new Error('File gagal dibaca.'));
    reader.readAsDataURL(file);
  });
}

function randomId(prefix: string): string {
  const suffix = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  return `${prefix}-${suffix}`;
}

async function requestPublicUploadConfig(): Promise<PublicUploadConfig> {
  if (env.USE_MOCK_DATA) {
    return mockResponse({
      cloud_name: 'rangkulmap-mock',
      upload_url: 'https://api.cloudinary.com/v1_1/rangkulmap-mock/image/upload',
      unsigned_upload_preset: 'rangkulmap_public_profile'
    }, MOCK_UPLOAD_DELAY_MS);
  }
  return apiClient.get<PublicUploadConfig>('/uploads/public-photo/config');
}

async function requestVerificationSignature(file: File): Promise<SignedUploadConfig> {
  if (env.USE_MOCK_DATA) {
    return mockResponse({
      cloud_name: 'rangkulmap-mock',
      upload_url: 'https://api.cloudinary.com/v1_1/rangkulmap-mock/auto/upload',
      api_key: 'mock-api-key',
      signature: randomId('mock-signature'),
      timestamp: Math.floor(Date.now() / 1000),
      folder: 'verification/private'
    }, MOCK_UPLOAD_DELAY_MS);
  }
  return apiClient.post<SignedUploadConfig>('/uploads/verification/signature', {
    file_name: file.name,
    content_type: file.type,
    file_size: file.size
  });
}

/**
 * Two-step unsigned public upload: request the allowed unsigned preset, then
 * upload directly. Used only for public profile photos.
 */
export async function uploadPublicPhoto(file: File): Promise<UploadResult> {
  const config = await requestPublicUploadConfig();

  if (env.USE_MOCK_DATA) {
    const url = await fileToDataUrl(file);
    return mockResponse<UploadResult>({ url, public_id: randomId('profile'), resource_type: 'image' }, MOCK_UPLOAD_DELAY_MS);
  }

  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', config.unsigned_upload_preset);
  const response = await fetch(config.upload_url, { method: 'POST', body });
  if (!response.ok) throw createAppError('server', 'Foto profil gagal diunggah.', response.status);
  const payload = (await response.json()) as {secure_url: string;public_id: string;resource_type: 'image' | 'raw';};
  return { url: payload.secure_url, public_id: payload.public_id, resource_type: payload.resource_type };
}

/**
 * Two-step signed upload: request an authenticated one-time signature, then
 * upload the private verification document directly to Cloudinary.
 */
export async function uploadVerificationDocument(file: File): Promise<VerificationUploadResult> {
  const signature = await requestVerificationSignature(file);

  if (env.USE_MOCK_DATA) {
    return mockResponse<VerificationUploadResult>({
      url: `mock-private://verification/${encodeURIComponent(file.name)}`,
      public_id: randomId('verification'),
      resource_type: file.type.startsWith('image/') ? 'image' : 'raw',
      document_id: randomId('document'),
      verification_status: 'pending'
    }, MOCK_UPLOAD_DELAY_MS);
  }

  const body = new FormData();
  body.append('file', file);
  body.append('api_key', signature.api_key);
  body.append('signature', signature.signature);
  body.append('timestamp', String(signature.timestamp));
  body.append('folder', signature.folder);
  const response = await fetch(signature.upload_url, { method: 'POST', body });
  if (!response.ok) throw createAppError('server', 'Dokumen verifikasi gagal diunggah.', response.status);
  const payload = (await response.json()) as {secure_url: string;public_id: string;resource_type: 'image' | 'raw';};
  const record = await apiClient.post<{document_id: string;}>('/uploads/verification/confirm', {
    public_id: payload.public_id,
    secure_url: payload.secure_url
  });
  return {
    url: payload.secure_url,
    public_id: payload.public_id,
    resource_type: payload.resource_type,
    document_id: record.document_id,
    verification_status: 'pending'
  };
}