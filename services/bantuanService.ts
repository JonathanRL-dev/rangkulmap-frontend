import { apiClient, createAppError, resolveWithMock } from './apiClient';
import {
  BantuanLocation,
  BantuanRequest,
  CreateBantuanRequestPayload } from
'../types/bantuan';
import { IncomingHelpRequest } from '../types/helpRequest';
import { Volunteer } from '../types/volunteer';

interface MockBantuanRequest extends BantuanRequest {
  requester_profile: {
    name: string;
    username: string;
    avatar_url?: string;
    trust_score: number;
    level: number;
    level_name: string;
  };
  distance_meters: number;
  waiting_minutes: number;
  priority: 'high' | 'normal';
}

type BantuanListener = () => void;

export const DEFAULT_BANTUAN_LOCATION: BantuanLocation = {
  latitude: -7.7828,
  longitude: 110.3741,
  address: 'Gondokusuman, Yogyakarta'
};

const mockVolunteers: Volunteer[] = [
{
  id: 'dimas-prasetyo',
  name: 'Dimas Prasetyo',
  trustScore: 92,
  distanceMeters: 180,
  imageUrl: "/6f45a9d8-5c0f-4756-a5ab-e138101a980c.jpg",
  availability: 'Siap membantu',
  rating: 4.9,
  etaMinutes: 4
},
{
  id: 'ayu-lestari',
  name: 'Ayu Lestari',
  trustScore: 96,
  distanceMeters: 320,
  imageUrl: "/19f421fa-be7c-4420-b3c1-fcfa8611ba41.jpg",
  availability: 'Aktif sekarang',
  rating: 5,
  etaMinutes: 6
},
{
  id: 'budi-santoso',
  name: 'Budi Santoso',
  trustScore: 89,
  distanceMeters: 450,
  imageUrl: "/78fae31e-1456-47b0-aebf-eed8df19bf14.jpg",
  availability: 'Siap membantu',
  rating: 4.8,
  etaMinutes: 8
},
{
  id: 'siti-nurhaliza',
  name: 'Siti Nurhaliza',
  trustScore: 94,
  distanceMeters: 520,
  imageUrl: "/bd09bf2f-ebf0-4d86-810d-d7abf6136bb2.jpg",
  availability: 'Aktif sekarang',
  rating: 4.9,
  etaMinutes: 9
},
{
  id: 'rizky-hidayat',
  name: 'Rizky Hidayat',
  trustScore: 87,
  distanceMeters: 640,
  imageUrl: "/a1e1b826-a6ef-4fcb-83cd-4fd55a45161d.jpg",
  availability: 'Siap membantu',
  rating: 4.7,
  etaMinutes: 11
},
{
  id: 'maya-anggraini',
  name: 'Maya Anggraini',
  trustScore: 91,
  distanceMeters: 780,
  imageUrl: "/bcc99e14-d092-4201-9ccb-a5f1503485a9.jpg",
  availability: 'Aktif sekarang',
  rating: 4.8,
  etaMinutes: 13
},
{
  id: 'hendra-wijaya',
  name: 'Hendra Wijaya',
  trustScore: 85,
  distanceMeters: 910,
  imageUrl: "/ea9bf941-b431-4c55-94eb-c6c13b54467b.jpg",
  availability: 'Siap membantu',
  rating: 4.6,
  etaMinutes: 15
}];


let mockRequests: MockBantuanRequest[] = [
createSeedRequest('req-1', 'RM-SKR1001', 'Ayu Lestari', 'ayulestari', 91, 9, 'Pemandu Inklusif', 'crossing', 'Butuh pendampingan menyeberang di perempatan Gejayan, lalu lintas cukup padat.', 180, 2, 'high'),
createSeedRequest('req-2', 'RM-SKR1002', 'Bagas Nugroho', 'bagasn', 86, 6, 'Penyambung Asa', 'stairs', 'Perlu bantuan menaiki tangga di halte, membawa satu tas kecil.', 340, 14, 'normal'),
createSeedRequest('req-3', 'RM-SKR1003', 'Rina Kusuma', 'rinakusuma', 78, 3, 'Penjelajah Ramah', 'carrying', 'Minta bantuan membawa dua kantong belanjaan ke lobi apartemen.', 620, 26, 'normal'),
createSeedRequest('req-4', 'RM-SKR1004', 'Pak Hendra', 'hendra.w', 94, 11, 'Penjaga Rute', 'other', 'Perlu bantuan membaca papan informasi rute bus di Terminal Condongcatur.', 430, 8, 'normal')];


const listeners = new Set<BantuanListener>();
let storeVersion = 0;

function createSeedRequest(
requestId: string,
requesterId: string,
name: string,
username: string,
trustScore: number,
level: number,
levelName: string,
helpType: BantuanRequest['jenis_bantuan'],
notes: string,
distanceMeters: number,
waitingMinutes: number,
priority: MockBantuanRequest['priority'])
: MockBantuanRequest {
  return {
    request_id: requestId,
    requester_id: requesterId,
    requester_role: 'seeker',
    jenis_bantuan: helpType,
    lokasi: DEFAULT_BANTUAN_LOCATION,
    status: 'searching',
    matched_volunteer_id: null,
    xp_awarded: 0,
    notes,
    created_at: new Date(Date.now() - waitingMinutes * 60_000).toISOString(),
    requester_profile: { name, username, trust_score: trustScore, level, level_name: levelName },
    distance_meters: distanceMeters,
    waiting_minutes: waitingMinutes,
    priority
  };
}

function notifyStore(): void {
  storeVersion += 1;
  listeners.forEach((listener) => listener());
}

function findRequest(id: string): MockBantuanRequest {
  const request = mockRequests.find((item) => item.request_id === id);
  if (!request) throw createAppError('notfound', 'Permintaan bantuan tidak ditemukan.');
  return request;
}

function updateRequest(id: string, patch: Partial<BantuanRequest>): MockBantuanRequest {
  const request = findRequest(id);
  const updated = { ...request, ...patch };
  mockRequests = mockRequests.map((item) => item.request_id === id ? updated : item);
  notifyStore();
  return updated;
}

function toIncomingRequest(request: MockBantuanRequest): IncomingHelpRequest {
  return {
    id: request.request_id,
    seekerName: request.requester_profile.name,
    seekerUsername: request.requester_profile.username,
    avatarUrl: request.requester_profile.avatar_url,
    trustScore: request.requester_profile.trust_score,
    level: request.requester_profile.level,
    levelName: request.requester_profile.level_name,
    helpType: request.jenis_bantuan,
    notes: request.notes,
    distanceMeters: request.distance_meters,
    waitingMinutes: request.waiting_minutes,
    priority: request.priority
  };
}

export function getNearbyVolunteers(location: BantuanLocation): Promise<Volunteer[]> {
  return resolveWithMock(
    () => {
      const locationOffset = Math.round(Math.abs(location.latitude - DEFAULT_BANTUAN_LOCATION.latitude) * 10_000);
      return mockVolunteers.
      map((volunteer) => ({ ...volunteer, distanceMeters: volunteer.distanceMeters + locationOffset })).
      sort((left, right) => left.distanceMeters - right.distanceMeters);
    },
    () => apiClient.get<Volunteer[]>('/bantuan/volunteers/nearby', {
      query: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    })
  );
}

export function getIncomingRequests(): Promise<IncomingHelpRequest[]> {
  return resolveWithMock(
    () => mockRequests.
    filter((request) => request.status === 'searching').
    map(toIncomingRequest),
    () => apiClient.get<IncomingHelpRequest[]>('/bantuan/requests/incoming')
  );
}

export function createBantuanRequest(payload: CreateBantuanRequestPayload): Promise<BantuanRequest> {
  return resolveWithMock(
    () => {
      const request: MockBantuanRequest = {
        request_id: `bantuan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        requester_id: payload.requester_id,
        requester_role: payload.requester_role,
        jenis_bantuan: payload.jenis_bantuan,
        lokasi: payload.lokasi,
        status: 'matched',
        matched_volunteer_id: mockVolunteers[0]?.id ?? null,
        xp_awarded: 0,
        notes: payload.notes?.trim() ?? '',
        created_at: new Date().toISOString(),
        requester_profile: {
          name: payload.requester_role === 'volunteer' ? 'Relawan Aktif' : 'Pencari Bantuan',
          username: payload.requester_id.toLowerCase(),
          trust_score: 90,
          level: 8,
          level_name: 'Pemandu Inklusif'
        },
        distance_meters: 180,
        waiting_minutes: 0,
        priority: 'normal'
      };
      mockRequests = [...mockRequests, request];
      notifyStore();
      return request;
    },
    () => apiClient.post<BantuanRequest>('/bantuan/requests', payload)
  );
}

export function acceptRequest(requestId: string): Promise<BantuanRequest> {
  return resolveWithMock(
    () => updateRequest(requestId, {
      status: 'in_progress',
      matched_volunteer_id: findRequest(requestId).matched_volunteer_id ?? mockVolunteers[0]?.id ?? null
    }),
    () => apiClient.post<BantuanRequest>(`/bantuan/requests/${encodeURIComponent(requestId)}/accept`)
  );
}

export function completeRequest(requestId: string): Promise<BantuanRequest> {
  return resolveWithMock(
    () => updateRequest(requestId, { status: 'completed', xp_awarded: 25 }),
    () => apiClient.post<BantuanRequest>(`/bantuan/requests/${encodeURIComponent(requestId)}/complete`)
  );
}

export function cancelRequest(requestId: string): Promise<BantuanRequest> {
  return resolveWithMock(
    () => updateRequest(requestId, { status: 'cancelled', matched_volunteer_id: null }),
    () => apiClient.post<BantuanRequest>(`/bantuan/requests/${encodeURIComponent(requestId)}/cancel`)
  );
}

export function subscribeToBantuan(listener: BantuanListener): () => void {
  listeners.add(listener);
  return () => {listeners.delete(listener);};
}

export function getBantuanStoreVersion(): number {
  return storeVersion;
}

export const bantuanService = {
  getNearbyVolunteers,
  getIncomingRequests,
  createBantuanRequest,
  acceptRequest,
  completeRequest,
  cancelRequest
};