import { env, isMockMode } from '../config/env';
import {
  SosProgressEvent,
  SosSession,
  SosStatusChangeEvent,
  VolunteerLocationUpdateEvent } from
'../types/sos';

/**
 * Centralised realtime client. While `USE_MOCK_DATA` is true it runs as an
 * in-memory event bus so modules can subscribe and emit exactly as they will
 * against the real Socket.io gateway. When the flag flips to false the same
 * API talks to `SOCKET_URL` over a WebSocket handshake.
 */

export type SocketStatus = 'idle' | 'connecting' | 'connected' | 'disconnected';

export type SocketListener = (payload: unknown) => void;

interface SocketEnvelope {
  event: string;
  payload: unknown;
}

/**
 * Realtime event names. These strings match the gateway contract exactly, so
 * swapping the mock stream for socket.io-client needs no component changes.
 */
export const SOS_EVENTS = {
  progress: 'sos:progress',
  volunteerLocationUpdate: 'volunteer:location_update',
  statusChange: 'sos:status_change'
} as const;

const PROGRESS_INTERVAL_MS = 2000;
const LOCATION_INTERVAL_MS = 3000;
const MICRO_CONFIRMATION_DELAY_MS = 1500;
const BROADCAST_DELAY_MS = 6000;

const listeners = new Map<string, Set<SocketListener>>();
const statusListeners = new Set<(status: SocketStatus) => void>();

let status: SocketStatus = 'idle';
let socket: WebSocket | null = null;

function setStatus(next: SocketStatus): void {
  if (status === next) return;
  status = next;
  statusListeners.forEach((listener) => listener(status));
}

function dispatch(event: string, payload: unknown): void {
  listeners.get(event)?.forEach((listener) => listener(payload));
}

function connectLive(): void {
  const url = `${env.SOCKET_URL.replace(/\/+$/, '')}${env.SOCKET_PATH}`;
  setStatus('connecting');
  socket = new WebSocket(url);

  socket.onopen = () => setStatus('connected');
  socket.onclose = () => {
    socket = null;
    setStatus('disconnected');
  };
  socket.onerror = () => setStatus('disconnected');
  socket.onmessage = (message: MessageEvent<string>) => {
    try {
      const envelope = JSON.parse(message.data) as SocketEnvelope;
      if (envelope?.event) dispatch(envelope.event, envelope.payload);
    } catch {

      // Ignore malformed frames; the gateway contract owns the envelope shape.
    }};
}

export const socketClient = {
  get status(): SocketStatus {
    return status;
  },

  /** Opens the realtime channel. Safe to call more than once. */
  connect(): void {
    if (!env.ENABLE_REALTIME || status === 'connected' || status === 'connecting') return;

    if (isMockMode()) {
      setStatus('connecting');
      window.setTimeout(() => setStatus('connected'), 300);
      return;
    }

    connectLive();
  },

  disconnect(): void {
    socket?.close();
    socket = null;
    setStatus('disconnected');
  },

  /** Subscribes to a server event. Returns the unsubscribe function. */
  on(event: string, listener: SocketListener): () => void {
    const bucket = listeners.get(event) ?? new Set<SocketListener>();
    bucket.add(listener);
    listeners.set(event, bucket);

    return () => {
      bucket.delete(listener);
      if (bucket.size === 0) listeners.delete(event);
    };
  },

  /** Sends an event to the server; echoes locally while mocking. */
  emit(event: string, payload: unknown = null): void {
    if (isMockMode()) {
      dispatch(event, payload);
      return;
    }

    if (socket?.readyState === WebSocket.OPEN) {
      const envelope: SocketEnvelope = { event, payload };
      socket.send(JSON.stringify(envelope));
    }
  },

  /** Used by mock services to push simulated server pushes into the bus. */
  simulateServerEvent(event: string, payload: unknown): void {
    dispatch(event, payload);
  },

  /**
   * Mock realtime stream for an active SOS session. It emits the same three
   * events the gateway sends (`sos:progress`, `volunteer:location_update`,
   * `sos:status_change`) on timers. Returns a stop function.
   */
  simulateSosStream(session: SosSession): () => void {
    if (!isMockMode()) return () => undefined;

    const startedAt = Date.now();
    let respondedVolunteers = 0;

    const emitStatus = (status: SosSession['status']) => {
      const payload: SosStatusChangeEvent = {
        sos_id: session.sos_id,
        status,
        changed_at: new Date().toISOString()
      };
      dispatch(SOS_EVENTS.statusChange, payload);
    };

    const progressTimer = window.setInterval(() => {
      const payload: SosProgressEvent = {
        sos_id: session.sos_id,
        status: session.status,
        elapsed_seconds: Math.round((Date.now() - startedAt) / 1000),
        notified_volunteers: session.notified_volunteers.length,
        responded_volunteers: respondedVolunteers
      };
      dispatch(SOS_EVENTS.progress, payload);
    }, PROGRESS_INTERVAL_MS);

    const locationTimer = window.setInterval(() => {
      const step = Math.round((Date.now() - startedAt) / LOCATION_INTERVAL_MS);
      session.notified_volunteers.forEach((volunteerId, index) => {
        const payload: VolunteerLocationUpdateEvent = {
          sos_id: session.sos_id,
          volunteer_id: volunteerId,
          latitude: session.lokasi.latitude + (index + 1) * 0.0004 - step * 0.0001,
          longitude: session.lokasi.longitude + (index + 1) * 0.0004 - step * 0.0001,
          eta_minutes: Math.max(1, (index + 1) * 3 - step)
        };
        dispatch(SOS_EVENTS.volunteerLocationUpdate, payload);
      });
    }, LOCATION_INTERVAL_MS);

    const microConfirmationTimer = window.setTimeout(
      () => emitStatus('micro_confirmation'),
      MICRO_CONFIRMATION_DELAY_MS
    );

    const broadcastTimer = window.setTimeout(() => {
      respondedVolunteers = 1;
      emitStatus('broadcasting');
    }, BROADCAST_DELAY_MS);

    return () => {
      window.clearInterval(progressTimer);
      window.clearInterval(locationTimer);
      window.clearTimeout(microConfirmationTimer);
      window.clearTimeout(broadcastTimer);
    };
  },

  onStatusChange(listener: (next: SocketStatus) => void): () => void {
    statusListeners.add(listener);
    return () => statusListeners.delete(listener);
  }
};