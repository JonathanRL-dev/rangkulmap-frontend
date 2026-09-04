import { Volunteer } from '../types/volunteer';

export type VolunteerFilter = 'all' | 'ready' | 'active';
export type VolunteerSort = 'distance' | 'trust';

export const READY_LABEL = 'Siap membantu';
export const ACTIVE_LABEL = 'Aktif sekarang';

export function countReady(volunteers: Volunteer[]): number {
  return volunteers.filter((volunteer) => volunteer.availability === READY_LABEL).length;
}

export function countActive(volunteers: Volunteer[]): number {
  return volunteers.filter((volunteer) => volunteer.availability === ACTIVE_LABEL).length;
}

/** Average distance rounded to the nearest 5 m so the label stays readable. */
export function averageDistanceMeters(volunteers: Volunteer[]): number {
  if (volunteers.length === 0) return 0;
  const total = volunteers.reduce((sum, volunteer) => sum + volunteer.distanceMeters, 0);
  return Math.round(total / volunteers.length / 5) * 5;
}

export function filterVolunteers(volunteers: Volunteer[], filter: VolunteerFilter): Volunteer[] {
  if (filter === 'ready') return volunteers.filter((volunteer) => volunteer.availability === READY_LABEL);
  if (filter === 'active') return volunteers.filter((volunteer) => volunteer.availability === ACTIVE_LABEL);
  return volunteers;
}

export function sortVolunteers(volunteers: Volunteer[], sort: VolunteerSort): Volunteer[] {
  return [...volunteers].sort((first, second) =>
  sort === 'trust' ? second.trustScore - first.trustScore : first.distanceMeters - second.distanceMeters
  );
}