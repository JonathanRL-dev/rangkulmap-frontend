import { HelpTypeId } from './helpRequest';

export interface Volunteer {
  id: string;
  name: string;
  trustScore: number;
  distanceMeters: number;
  imageUrl: string;
  availability: string;
  rating?: number;
  etaMinutes?: number;
}

/** An accepted request the relawan is currently working on. */
export interface ActiveHelpSession {
  requestId: string;
  seekerName: string;
  helpType: HelpTypeId;
  distanceMeters: number;
  startedAtLabel: string;
}