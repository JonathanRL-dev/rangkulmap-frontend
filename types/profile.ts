export type ActivityKind = 'help-request' | 'volunteer-help' | 'infrastructure' | 'sos-cancelled' | 'reward';

export interface ActivityLogEntry {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  timestamp: string;
}

export type LocationPrecision = 'exact' | 'approximate';

export interface LocationPrivacySettings {
  shareWhileRequesting: boolean;
  precision: LocationPrecision;
  visibleInNearbyList: boolean;
  keepLocationHistory: boolean;
}