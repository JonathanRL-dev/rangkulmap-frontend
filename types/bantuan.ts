import { HelpTypeId } from './helpRequest';

export type BantuanRequesterRole = 'seeker' | 'volunteer';
export type BantuanRequestStatus =
'searching' |
'matched' |
'accepted' |
'in_progress' |
'completed' |
'cancelled';

export interface BantuanLocation {
  latitude: number;
  longitude: number;
  address: string;
}

/** Canonical bantuan_requests record shared by mock and live implementations. */
export interface BantuanRequest {
  request_id: string;
  requester_id: string;
  requester_role: BantuanRequesterRole;
  jenis_bantuan: HelpTypeId;
  lokasi: BantuanLocation;
  status: BantuanRequestStatus;
  matched_volunteer_id: string | null;
  xp_awarded: number;
  notes: string;
  created_at: string;
}

export interface CreateBantuanRequestPayload {
  requester_id: string;
  requester_role: BantuanRequesterRole;
  jenis_bantuan: HelpTypeId;
  lokasi: BantuanLocation;
  notes?: string;
}