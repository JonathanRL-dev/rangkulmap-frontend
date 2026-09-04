export type ProfessionalServiceType = 'lansia' | 'disabilitas' | 'rehabilitasi' | 'keperawatan';

export interface ProfessionalReview {
  author: string;
  rating: number;
  text: string;
}

export interface Professional {
  id: string;
  name: string;
  credential: string;
  imageUrl: string;
  serviceType: ProfessionalServiceType;
  specialization: string;
  location: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  verified: boolean;
  bio: string;
  qualifications: string[];
  reviews: ProfessionalReview[];
}

export interface ServiceTypeOption {
  id: ProfessionalServiceType;
  label: string;
}