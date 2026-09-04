import { apiClient, createAppError, resolveWithMock } from './apiClient';
import { uploadPublicPhoto } from './uploadService';
import {
  InfrastructureBounds,
  InfrastructureCategoryOption,
  InfrastructurePoint,
  InfrastructureReportPayload,
  InfrastructureReportResult } from
'../types/infrastructure';

export const DEFAULT_INFRASTRUCTURE_BOUNDS: InfrastructureBounds = {
  north: -7.75,
  east: 110.42,
  south: -7.84,
  west: 110.32
};

export const DEFAULT_MAP_COORDINATES = {
  latitude: -7.7828,
  longitude: 110.3741
};

const mockCategories: InfrastructureCategoryOption[] = [
{ id: 'wheelchair-route', label: 'Jalur Ramah Kursi Roda' },
{ id: 'accessible-toilet', label: 'Toilet Aksesibel' },
{ id: 'elevator', label: 'Lift/Elevator' },
{ id: 'disabled-parking', label: 'Parkir Disabilitas' },
{ id: 'accessible-stop', label: 'Halte Aksesibel' }];


let mockPoints: InfrastructurePoint[] = [
{
  id: 'trotoar-kotabaru',
  name: 'Trotoar Inklusif Kotabaru',
  category: 'wheelchair-route',
  description: 'Jalur lebar dengan curb ramp landai dan guiding block yang tersambung.',
  address: 'Jl. Suroto, Kotabaru, Yogyakarta',
  latitude: -7.7839,
  longitude: 110.3726,
  verified: true,
  condition: 'Baik',
  imageUrl: "/7fe9faba-3b19-4692-87b0-d50db6697ad6.jpg",
  position: { top: '34%', left: '44%' }
},
{
  id: 'toilet-taman-pintar',
  name: 'Toilet Aksesibel Taman Pintar',
  category: 'accessible-toilet',
  description: 'Toilet dengan handrail, pintu lebar, dan ruang putar kursi roda.',
  address: 'Jl. Panembahan Senopati, Yogyakarta',
  latitude: -7.8009,
  longitude: 110.3678,
  verified: true,
  condition: 'Baik',
  imageUrl: "/a792df66-2f96-43d3-97a5-6c9b819c9bdd.jpg",
  position: { top: '59%', left: '57%' }
},
{
  id: 'lift-galeria',
  name: 'Lift Area Publik Galeria',
  category: 'elevator',
  description: 'Lift publik dengan tombol rendah; informasi audio perlu dikonfirmasi.',
  address: 'Jl. Jend. Sudirman, Yogyakarta',
  latitude: -7.7822,
  longitude: 110.3791,
  verified: false,
  condition: 'Baik',
  imageUrl: "/73c9d33a-8fc0-4618-8ab8-7617c0fb86fc.jpg",
  position: { top: '27%', left: '66%' }
},
{
  id: 'parkir-puskesmas',
  name: 'Parkir Disabilitas Puskesmas',
  category: 'disabled-parking',
  description: 'Petak parkir lebar dekat pintu utama dengan akses ramp langsung.',
  address: 'Puskesmas Gondokusuman, Yogyakarta',
  latitude: -7.7848,
  longitude: 110.3876,
  verified: true,
  condition: 'Baik',
  imageUrl: "/e3b305df-9cc8-4440-bede-3971faad5f04.jpg",
  position: { top: '51%', left: '29%' }
},
{
  id: 'halte-sudirman',
  name: 'Halte Trans Jogja Sudirman',
  category: 'accessible-stop',
  description: 'Peron rata dengan guiding block; celah naik bus belum diverifikasi.',
  address: 'Jl. Jend. Sudirman, Yogyakarta',
  latitude: -7.7825,
  longitude: 110.3758,
  verified: false,
  condition: 'Baik',
  imageUrl: "/de7be4a3-73b4-4fd1-b4f5-174084230f75.jpg",
  position: { top: '72%', left: '70%' }
},
{
  id: 'ramp-malioboro',
  name: 'Ramp Pejalan Kaki Malioboro',
  category: 'wheelchair-route',
  description: 'Ramp penghubung trotoar di persimpangan; permukaan perlu diperiksa ulang.',
  address: 'Kawasan Malioboro, Yogyakarta',
  latitude: -7.7925,
  longitude: 110.3658,
  verified: false,
  condition: 'Rusak',
  imageUrl: "/7fe9faba-3b19-4692-87b0-d50db6697ad6.jpg",
  position: { top: '66%', left: '39%' }
}];


function isPointInBounds(point: InfrastructurePoint, bounds: InfrastructureBounds): boolean {
  return point.latitude <= bounds.north && point.latitude >= bounds.south &&
  point.longitude <= bounds.east && point.longitude >= bounds.west;
}

export function getInfrastructureCategories(): Promise<InfrastructureCategoryOption[]> {
  return resolveWithMock(
    () => [...mockCategories],
    () => apiClient.get<InfrastructureCategoryOption[]>('/map/infrastructure/categories')
  );
}

export function getPointsInBounds(bounds: InfrastructureBounds): Promise<InfrastructurePoint[]> {
  return resolveWithMock(
    () => mockPoints.filter((point) => isPointInBounds(point, bounds)),
    () => apiClient.get<InfrastructurePoint[]>('/map/infrastructure/points', {
      query: bounds
    })
  );
}

export async function reportNewPoint(payload: InfrastructureReportPayload): Promise<InfrastructureReportResult> {
  const uploadedPhoto = await uploadPublicPhoto(payload.photo);
  const requestPayload = {
    category: payload.category,
    condition: payload.condition,
    notes: payload.notes,
    latitude: payload.latitude,
    longitude: payload.longitude,
    photo_url: uploadedPhoto.url,
    photo_public_id: uploadedPhoto.public_id
  };

  return resolveWithMock(
    () => ({ report_id: `infra-report-${Date.now()}`, status: 'pending_verification' as const }),
    () => apiClient.post<InfrastructureReportResult>('/map/infrastructure/points/reports', requestPayload)
  );
}

export function confirmPoint(id: string): Promise<InfrastructurePoint> {
  return resolveWithMock(
    () => {
      const point = mockPoints.find((item) => item.id === id);
      if (!point) throw createAppError('notfound', 'Titik infrastruktur tidak ditemukan.');
      const updatedPoint = { ...point, verified: true };
      mockPoints = mockPoints.map((item) => item.id === id ? updatedPoint : item);
      return updatedPoint;
    },
    () => apiClient.post<InfrastructurePoint>(`/map/infrastructure/points/${encodeURIComponent(id)}/confirm`)
  );
}

export function reportPointChanged(id: string): Promise<InfrastructureReportResult> {
  return resolveWithMock(
    () => {
      if (!mockPoints.some((item) => item.id === id)) throw createAppError('notfound', 'Titik infrastruktur tidak ditemukan.');
      return { report_id: `infra-change-${Date.now()}`, status: 'pending_verification' as const };
    },
    () => apiClient.post<InfrastructureReportResult>(`/map/infrastructure/points/${encodeURIComponent(id)}/changed`)
  );
}

export const infrastrukturService = {
  getPointsInBounds,
  reportNewPoint,
  confirmPoint,
  reportPointChanged,
  getInfrastructureCategories
};