export type UserRole = 'seeker' | 'volunteer' | 'professional';

export type UserStatus = 'active' | 'pending_verification' | 'suspended';

/** Core user schema follows Auth Module contract naming. */
export interface AuthUser {
  account_id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  display_name: string;
  avatar_url?: string;
  needs?: string[];
  emergency_contact?: string;
  domicile?: string;
  license_number?: string;
  specialization?: string;
  hourly_rate?: number;
  verification_documents?: {
    ktp_document_id?: string;
    selfie_document_id?: string;
    certification_document_id?: string;
  };
}

export interface RegisterPayload {
  display_name: string;
  role: UserRole;
  username: string;
  email: string;
  password: string;
  needs?: string[];
  emergency_contact?: string;
  domicile?: string;
  avatar_url?: string;
  license_number?: string;
  specialization?: string;
  hourly_rate?: number;
  verification_documents?: AuthUser['verification_documents'];
}

export interface AuthResult {
  success: boolean;
  message: string;
}