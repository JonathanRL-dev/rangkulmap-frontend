import { apiClient, createAppError, resolveWithMock } from './apiClient';
import { getReviews } from './reviewService';
import {
  CreateProfessionalBookingPayload,
  ProfessionalBooking } from
'../types/booking';
import {
  Professional,
  ProfessionalReview,
  ProfessionalServiceType,
  ServiceTypeOption } from
'../types/professional';

export interface ProfessionalFilters {
  serviceType?: ProfessionalServiceType | 'all';
  location?: string | 'all';
  availableDate?: string;
}

type ProfessionalProfile = Omit<Professional, 'reviews'>;

export const PROFESSIONAL_SERVICE_TYPES: ServiceTypeOption[] = [
{ id: 'lansia', label: 'Pendampingan Lansia' },
{ id: 'disabilitas', label: 'Pendampingan Disabilitas' },
{ id: 'rehabilitasi', label: 'Rehabilitasi & Fisioterapi' },
{ id: 'keperawatan', label: 'Keperawatan Medis' }];


export const PROFESSIONAL_LOCATIONS = ['Yogyakarta', 'Surabaya', 'Bandung', 'Jakarta'];

const mockProfessionals: ProfessionalProfile[] = [
{
  id: 'ratna-kusuma',
  name: 'Ns. Ratna Kusuma, S.Kep',
  credential: 'Perawat Terdaftar',
  imageUrl: "/e4113e2c-207f-46d8-83c4-5314d7b981bd.jpg",
  serviceType: 'lansia',
  specialization: 'Pendampingan lansia & manajemen obat harian',
  location: 'Surabaya',
  rating: 4.9,
  reviewCount: 128,
  hourlyRate: 85000,
  verified: true,
  bio: 'Perawat terdaftar dengan 9 tahun pengalaman mendampingi lansia di rumah, termasuk manajemen obat, mobilitas ringan, dan pemantauan kondisi harian.',
  qualifications: [
  'STR Aktif No. 5021-2031-1180234',
  'Sertifikasi Keperawatan Gerontik',
  'Pelatihan Bantuan Hidup Dasar (BLS)']

},
{
  id: 'andika-pratama',
  name: 'Andika Pratama, Amd.Ft',
  credential: 'Fisioterapis',
  imageUrl: "/7c6501e6-0cdf-49cd-a185-396fe6f8e5ef.jpg",
  serviceType: 'rehabilitasi',
  specialization: 'Rehabilitasi mobilitas & terapi pasca stroke',
  location: 'Yogyakarta',
  rating: 4.8,
  reviewCount: 76,
  hourlyRate: 95000,
  verified: true,
  bio: 'Fisioterapis klinis yang berfokus pada pemulihan mobilitas pengguna kursi roda dan pendampingan pasca stroke dengan pendekatan latihan bertahap.',
  qualifications: [
  'STR Aktif No. 3312-2029-0098871',
  'Sertifikasi Terapi Neuromuskular',
  'Pelatihan Penanganan Pasien Mobilitas Terbatas']

},
{
  id: 'maya-anindita',
  name: 'Maya Anindita, S.Tr.OT',
  credential: 'Terapis Okupasi',
  imageUrl: "/1382f9b6-2c68-4dae-b9bd-1efbdc1a9973.jpg",
  serviceType: 'disabilitas',
  specialization: 'Pendampingan aktivitas harian penyandang disabilitas',
  location: 'Bandung',
  rating: 5,
  reviewCount: 54,
  hourlyRate: 90000,
  verified: true,
  bio: 'Terapis okupasi yang membantu penyandang disabilitas membangun kemandirian dalam aktivitas sehari-hari melalui pendekatan yang personal dan suportif.',
  qualifications: [
  'STR Aktif No. 4471-2030-0056612',
  'Sertifikasi Terapi Okupasi Anak & Dewasa',
  'Pelatihan Aksesibilitas & Adaptasi Lingkungan']

},
{
  id: 'farid-hidayat',
  name: 'Farid Hidayat, Amd.Kep',
  credential: 'Perawat Home Care',
  imageUrl: "/3e854a37-dc7b-4e12-8b47-1cc05eebc45c.jpg",
  serviceType: 'keperawatan',
  specialization: 'Perawatan medis rumah & pemantauan pasca operasi',
  location: 'Jakarta',
  rating: 4.7,
  reviewCount: 203,
  hourlyRate: 100000,
  verified: true,
  bio: 'Perawat home care berpengalaman menangani perawatan luka, pemantauan tanda vital, dan pendampingan medis pasca operasi langsung di rumah pasien.',
  qualifications: [
  'STR Aktif No. 2209-2028-0071145',
  'Sertifikasi Perawatan Luka Modern',
  'Pelatihan Kegawatdaruratan Medis Dasar']

}];


let mockBookings: ProfessionalBooking[] = [];

function toProfessional(profile: ProfessionalProfile, reviews: ProfessionalReview[] = []): Professional {
  return { ...profile, reviews };
}

function mapClientReviews(reviews: Awaited<ReturnType<typeof getReviews>>): ProfessionalReview[] {
  return reviews.map((review) => ({
    author: review.author ?? 'Klien RangkulMap',
    rating: review.rating,
    text: review.comment ?? review.tags.join(' · ')
  }));
}

function findMockProfessional(id: string): ProfessionalProfile {
  const professional = mockProfessionals.find((item) => item.id === id);
  if (!professional) throw createAppError('notfound', 'Mitra profesional tidak ditemukan.');
  return professional;
}

export function getProfessionalListSnapshot(filters: ProfessionalFilters = {}): Professional[] {
  return mockProfessionals.
  filter((professional) =>
  (filters.serviceType === undefined || filters.serviceType === 'all' || professional.serviceType === filters.serviceType) && (
  filters.location === undefined || filters.location === 'all' || professional.location === filters.location)
  ).
  map((professional) => toProfessional(professional));
}

export function getProfessionals(filters: ProfessionalFilters = {}): Promise<Professional[]> {
  return resolveWithMock(
    () => getProfessionalListSnapshot(filters),
    () => apiClient.get<Professional[]>('/professional-services', {
      query: {
        service_type: filters.serviceType === 'all' ? undefined : filters.serviceType,
        location: filters.location === 'all' ? undefined : filters.location,
        available_date: filters.availableDate
      }
    })
  );
}

export function getProfessionalDetail(id: string): Promise<Professional> {
  return resolveWithMock(
    async () => {
      const professional = findMockProfessional(id);
      const reviews = await getReviews(id, 'professional');
      return toProfessional(professional, mapClientReviews(reviews));
    },
    async () => {
      const professional = await apiClient.get<Professional>(`/professional-services/${encodeURIComponent(id)}`);
      const reviews = await getReviews(id, 'professional');
      return { ...professional, reviews: mapClientReviews(reviews) };
    }
  );
}

export function createBooking(payload: CreateProfessionalBookingPayload): Promise<ProfessionalBooking> {
  return resolveWithMock(
    () => {
      findMockProfessional(payload.professional_id);
      const now = new Date().toISOString();
      const booking: ProfessionalBooking = {
        booking_id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        client_id: payload.client_id,
        professional_id: payload.professional_id,
        tanggal: payload.tanggal,
        durasi: payload.durasi,
        catatan: payload.catatan?.trim() ?? '',
        biaya: payload.biaya,
        status: 'pending_confirmation',
        created_at: now,
        updated_at: now
      };
      mockBookings = [...mockBookings, booking];
      return booking;
    },
    () => apiClient.post<ProfessionalBooking>('/professional-bookings', payload)
  );
}

export function getBookingDetail(id: string): Promise<ProfessionalBooking> {
  return resolveWithMock(
    () => {
      const booking = mockBookings.find((item) => item.booking_id === id);
      if (!booking) throw createAppError('notfound', 'Booking profesional tidak ditemukan.');
      return booking;
    },
    () => apiClient.get<ProfessionalBooking>(`/professional-bookings/${encodeURIComponent(id)}`)
  );
}

export function cancelBooking(id: string): Promise<ProfessionalBooking> {
  return resolveWithMock(
    () => {
      const booking = mockBookings.find((item) => item.booking_id === id);
      if (!booking) throw createAppError('notfound', 'Booking profesional tidak ditemukan.');
      const cancelled: ProfessionalBooking = {
        ...booking,
        status: 'cancelled',
        updated_at: new Date().toISOString()
      };
      mockBookings = mockBookings.map((item) => item.booking_id === id ? cancelled : item);
      return cancelled;
    },
    () => apiClient.post<ProfessionalBooking>(`/professional-bookings/${encodeURIComponent(id)}/cancel`)
  );
}

/** Synchronous mock snapshot prevents a visual flash while service hydration runs. */
export function getProfessionalSnapshot(id?: string): Professional | null {
  if (!id) return null;
  const professional = mockProfessionals.find((item) => item.id === id);
  return professional ? toProfessional(professional) : null;
}

export const bookingService = {
  getProfessionals,
  getProfessionalDetail,
  createBooking,
  getBookingDetail,
  cancelBooking
};