export type InfrastructureCategory =
'wheelchair-route' |
'accessible-toilet' |
'elevator' |
'disabled-parking' |
'accessible-stop';

export type InfrastructureCondition = 'Baik' | 'Rusak';

export interface InfrastructureCategoryOption {
  id: InfrastructureCategory;
  label: string;
}

export interface InfrastructureBounds {
  north: number;
  east: number;
  south: number;
  west: number;
}

export interface InfrastructurePoint {
  id: string;
  name: string;
  category: InfrastructureCategory;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  verified: boolean;
  condition: InfrastructureCondition;
  imageUrl: string;
  position: {
    top: string;
    left: string;
  };
}

export interface InfrastructureReportFormValues {
  photo: File;
  category: InfrastructureCategory;
  condition: InfrastructureCondition;
  notes: string;
}

export interface InfrastructureReportPayload extends InfrastructureReportFormValues {
  latitude: number;
  longitude: number;
}

export interface InfrastructureReportResult {
  report_id: string;
  status: 'pending_verification';
}