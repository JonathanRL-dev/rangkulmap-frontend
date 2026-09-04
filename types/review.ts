export type ReviewTargetType = 'volunteer' | 'professional';
export type ReviewSourceType = 'bantuan_request' | 'professional_booking';

export interface Review {
  review_id: string;
  reviewer_id: string;
  target_id: string;
  target_type: ReviewTargetType;
  source_id: string;
  source_type: ReviewSourceType;
  author?: string;
  rating: number;
  tags: string[];
  comment?: string;
  created_at: string;
}

export interface CreateReviewPayload {
  reviewer_id: string;
  target_id: string;
  target_type: ReviewTargetType;
  source_id: string;
  source_type: ReviewSourceType;
  rating: number;
  tags: string[];
  comment?: string;
}