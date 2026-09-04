import { env } from '../config/env';
import { SosLocation, SosSession, SosStatus } from '../types/sos';
import { apiClient, createAppError, deviceIsOffline, resolveWithMock } from './apiClient';
import { SOS_EVENTS, socketClient } from './socketClient';

/**
 * Every piece of SOS state — including the failure simulation used by the
 * high-contrast SOS error screen — lives here. Components and hooks never keep
 * their own dummy SOS state.
 */

export const DEFAULT_SOS_LOCATION: SosLocation = {
  latitude: -7.7828,
  longitude: 110.3741,
  address: 'Gondokusuman, Yogyakarta'
};

const NOTIFIED_VOLUNTEERS = ['dimas-prasetyo', 'ayu-lestari', 'budi-santoso'];

let mockSessions: SosSession[] = [];
let stopMockStream: (() => void) | null = null;

/** Failure simulation is owned by the service, never by a component. */
let failureSimulationEnabled = false;
let failedAttempts = 0;

export function configureSosFailureSimulation(enabled: boolean): void {
  failureSimulationEnabled = enabled;
  if (!enabled) failedAttempts = 0;
}

/** True when this attempt must fail so the SOS failure screen can be shown. */
function shouldFailAttempt(): boolean {
  if (deviceIsOffline()) return true;
  return failureSimulationEnabled && failedAttempts === 0;
}

function findSession(sosId: string): SosSession {
  const session = mockSessions.find((item) => item.sos_id === sosId);
  if (!session) throw createAppError('notfound', 'Sesi SOS tidak ditemukan.');
  return session;
}

function updateSession(sosId: string, status: SosStatus): SosSession {
  const updated: SosSession = {
    ...findSession(sosId),
    status,
    updated_at: new Date().toISOString()
  };
  mockSessions = mockSessions.map((item) => item.sos_id === sosId ? updated : item);
  return updated;
}

export function triggerSos(location: SosLocation = DEFAULT_SOS_LOCATION, requesterId = 'RM-GUEST01'): Promise<SosSession> {
  if (env.SOS_DISABLED_FOR_TESTING) {
    const now = new Date().toISOString();
    return Promise.resolve({
      sos_id: 'sos-disabled',
      requester_id: requesterId,
      lokasi: location,
      status: 'disabled',
      notified_volunteers: [],
      created_at: now,
      updated_at: now
    });
  }

  return resolveWithMock(
    () => {
      if (shouldFailAttempt()) {
        failedAttempts += 1;
        throw createAppError('network', 'Sinyal darurat gagal terkirim.');
      }
      failedAttempts = 0;

      const now = new Date().toISOString();
      const session: SosSession = {
        sos_id: `sos-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        requester_id: requesterId,
        lokasi: location,
        status: 'broadcasting',
        notified_volunteers: [...NOTIFIED_VOLUNTEERS],
        created_at: now,
        updated_at: now
      };
      mockSessions = [...mockSessions, session];

      stopMockStream?.();
      stopMockStream = socketClient.simulateSosStream(session);
      return session;
    },
    () => apiClient.post<SosSession>('/sos', {
      requester_id: requesterId,
      lokasi: location
    })
  );
}

export function cancelSos(sosId: string): Promise<SosSession> {
  return resolveWithMock(
    () => {
      const session = updateSession(sosId, 'cancelled');
      stopMockStream?.();
      stopMockStream = null;
      socketClient.simulateServerEvent(SOS_EVENTS.statusChange, {
        sos_id: session.sos_id,
        status: session.status,
        changed_at: session.updated_at
      });
      return session;
    },
    () => apiClient.post<SosSession>(`/sos/${encodeURIComponent(sosId)}/cancel`)
  );
}

export function getSosStatus(sosId: string): Promise<SosSession> {
  return resolveWithMock(
    () => findSession(sosId),
    () => apiClient.get<SosSession>(`/sos/${encodeURIComponent(sosId)}`)
  );
}

export const sosService = { triggerSos, cancelSos, getSosStatus, configureSosFailureSimulation };