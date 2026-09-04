import { apiClient, createAppError, resolveWithMock } from './apiClient';
import { CreateReviewPayload, Review } from '../types/review';

const mockReviews: Review[] = [
seedProfessionalReview('ratna-kusuma', 'Bu Sri W.', 5, 'Sangat sabar dan komunikatif, ibu saya merasa nyaman didampingi.'),
seedProfessionalReview('ratna-kusuma', 'Keluarga Handoko', 5, 'Selalu tepat waktu dan detail mencatat kondisi kesehatan.'),
seedProfessionalReview('ratna-kusuma', 'Pak Yusuf', 4.7, 'Profesional, memberi saran perawatan yang mudah diikuti keluarga.'),
seedProfessionalReview('andika-pratama', 'Ibu Wulandari', 5, 'Program latihannya jelas, ayah saya semakin percaya diri berjalan.'),
seedProfessionalReview('andika-pratama', 'Rizky A.', 4.6, 'Sangat menguasai teknik pendampingan kursi roda.'),
seedProfessionalReview('andika-pratama', 'Keluarga Santosa', 4.8, 'Ramah dan menjelaskan setiap sesi terapi dengan detail.'),
seedProfessionalReview('maya-anindita', 'Keluarga Nabila', 5, 'Sangat memahami kebutuhan anak kami, pendekatannya lembut.'),
seedProfessionalReview('maya-anindita', 'Pak Agus', 5, 'Membantu meningkatkan kemandirian dengan cara yang menyenangkan.'),
seedProfessionalReview('maya-anindita', 'Ibu Ratih', 4.9, 'Komunikasi jelas dan selalu memberi laporan perkembangan.'),
seedProfessionalReview('farid-hidayat', 'Keluarga Prasetyo', 4.8, 'Sangat teliti merawat luka pasca operasi ayah saya.'),
seedProfessionalReview('farid-hidayat', 'Ibu Melani', 4.5, 'Selalu update kondisi pasien secara berkala.'),
seedProfessionalReview('farid-hidayat', 'Pak Dedi', 4.8, 'Tenang dan cekatan saat menangani situasi darurat ringan.')];


function seedProfessionalReview(targetId: string, author: string, rating: number, comment: string): Review {
  return {
    review_id: `seed-${targetId}-${author.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    reviewer_id: `RM-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
    target_id: targetId,
    target_type: 'professional',
    source_id: `booking-seed-${targetId}`,
    source_type: 'professional_booking',
    author,
    rating,
    tags: [],
    comment,
    created_at: '2026-01-15T08:00:00.000Z'
  };
}

export function submitReview(payload: CreateReviewPayload): Promise<Review> {
  return resolveWithMock(
    () => {
      if (payload.rating < 1 || payload.rating > 5) {
        throw createAppError('validation', 'Rating harus berada di antara 1 dan 5 bintang.');
      }
      const review: Review = {
        ...payload,
        review_id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        tags: [...payload.tags],
        comment: payload.comment?.trim() || undefined,
        created_at: new Date().toISOString()
      };
      mockReviews.push(review);
      return review;
    },
    () => apiClient.post<Review>('/reviews', payload)
  );
}

export function getReviews(targetId: string, targetType: Review['target_type']): Promise<Review[]> {
  return resolveWithMock(
    () => mockReviews.filter((review) => review.target_id === targetId && review.target_type === targetType),
    () => apiClient.get<Review[]>('/reviews', {
      query: { target_id: targetId, target_type: targetType }
    })
  );
}

export const reviewService = { submitReview, getReviews };