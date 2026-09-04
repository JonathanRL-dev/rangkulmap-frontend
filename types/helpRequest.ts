export type HelpTypeId = 'crossing' | 'stairs' | 'carrying' | 'other';

export interface HelpTypeOption {
  id: HelpTypeId;
  title: string;
  description: string;
}

export interface MapPinPosition {
  x: number;
  y: number;
}

export interface HelpRequestDraft {
  helpType: HelpTypeId | null;
  notes: string;
  pinPosition: MapPinPosition;
  volunteerIndex: number;
}

/** A request as seen by a relawan, including the requester's trust and level. */
export interface IncomingHelpRequest {
  id: string;
  seekerName: string;
  seekerUsername: string;
  avatarUrl?: string;
  trustScore: number;
  level: number;
  levelName: string;
  helpType: HelpTypeId;
  notes: string;
  distanceMeters: number;
  /** How long the requester has been waiting, used for priority ordering. */
  waitingMinutes: number;
  priority: 'high' | 'normal';
}