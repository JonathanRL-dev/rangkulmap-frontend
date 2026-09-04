export type SosStatus =
'disabled' |
'countdown' |
'micro_confirmation' |
'broadcasting' |
'cancelled' |
'resolved' |
'failed';

export type SosPhase = 'idle' | 'sending' | 'active' | 'cancelled' | 'failed';

export interface SosLocation {
  latitude: number;
  longitude: number;
  address: string;
}

/** Canonical sos_sessions record shared by mock and live implementations. */
export interface SosSession {
  sos_id: string;
  requester_id: string;
  lokasi: SosLocation;
  status: SosStatus;
  notified_volunteers: string[];
  created_at: string;
  updated_at: string;
}

export interface SosProgressEvent {
  sos_id: string;
  status: SosStatus;
  elapsed_seconds: number;
  notified_volunteers: number;
  responded_volunteers: number;
}

export interface VolunteerLocationUpdateEvent {
  sos_id: string;
  volunteer_id: string;
  latitude: number;
  longitude: number;
  eta_minutes: number;
}

export interface SosStatusChangeEvent {
  sos_id: string;
  status: SosStatus;
  changed_at: string;
}