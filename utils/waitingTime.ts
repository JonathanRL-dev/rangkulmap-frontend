import { IncomingHelpRequest } from '../types/helpRequest';

/** Human label for how long a request has been waiting. */
export function formatWaitingLabel(waitingMinutes: number): string {
  if (waitingMinutes <= 0) return 'Baru saja';
  if (waitingMinutes < 60) return `${waitingMinutes} menit menunggu`;

  const hours = Math.floor(waitingMinutes / 60);
  const minutes = waitingMinutes % 60;
  return minutes === 0 ? `${hours} jam menunggu` : `${hours} jam ${minutes} menit menunggu`;
}

/** Priority requests first, then whoever has been waiting the longest. */
export function sortActiveRequests(requests: IncomingHelpRequest[]): IncomingHelpRequest[] {
  return [...requests].sort((first, second) => {
    if (first.priority !== second.priority) return first.priority === 'high' ? -1 : 1;
    return second.waitingMinutes - first.waitingMinutes;
  });
}