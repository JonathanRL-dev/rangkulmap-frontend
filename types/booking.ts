export type ProfessionalBookingStatus =
'pending_confirmation' |
'confirmed' |
'in_progress' |
'completed' |
'cancelled';

/** Canonical bookings_profesional record shared by mock and live implementations. */
export interface ProfessionalBooking {
  booking_id: string;
  client_id: string;
  professional_id: string;
  tanggal: string;
  durasi: number;
  catatan: string;
  biaya: number;
  status: ProfessionalBookingStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateProfessionalBookingPayload {
  client_id: string;
  professional_id: string;
  tanggal: string;
  durasi: number;
  catatan?: string;
  biaya: number;
}