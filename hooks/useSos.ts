import { useCallback, useEffect, useRef, useState } from 'react';

import { env } from '../config/env';
import { useErrorHandling } from '../contexts/ErrorHandlingContext';
import {
  cancelSos as cancelSosService,
  configureSosFailureSimulation,
  getSosStatus as getSosStatusService,
  triggerSos as triggerSosService } from
'../services/sosService';
import { SOS_EVENTS, socketClient } from '../services/socketClient';
import { AppErrorType, toAppError } from '../services/apiClient';
import {
  SosLocation,
  SosPhase,
  SosProgressEvent,
  SosSession,
  SosStatusChangeEvent,
  VolunteerLocationUpdateEvent } from
'../types/sos';
import { useAuth } from './useAuth';

interface UseSosValue {
  phase: SosPhase;
  session: SosSession | null;
  progress: SosProgressEvent | null;
  volunteerLocations: VolunteerLocationUpdateEvent[];
  isSending: boolean;
  isActive: boolean;
  isSosDisabled: boolean;
  failureOpen: boolean;
  noticeOpen: boolean;
  /** Kept for parity with other modules; SOS never renders a toast. */
  errorType: AppErrorType | null;
  sendSos: () => Promise<void>;
  cancelSos: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  dismissFailure: () => void;
  dismissNotice: () => void;
}

export function useSos(location?: SosLocation): UseSosValue {
  const { user } = useAuth();
  const { simulateFailures } = useErrorHandling();
  const [phase, setPhase] = useState<SosPhase>('idle');
  const [session, setSession] = useState<SosSession | null>(null);
  const [progress, setProgress] = useState<SosProgressEvent | null>(null);
  const [volunteerLocations, setVolunteerLocations] = useState<VolunteerLocationUpdateEvent[]>([]);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [failureOpen, setFailureOpen] = useState(false);
  const [errorType, setErrorType] = useState<AppErrorType | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // The service owns the failure simulation; the hook only forwards the flag.
  useEffect(() => {
    configureSosFailureSimulation(simulateFailures);
  }, [simulateFailures]);

  useEffect(() => {
    if (env.SOS_DISABLED_FOR_TESTING) return undefined;

    socketClient.connect();

    const unsubscribeProgress = socketClient.on(SOS_EVENTS.progress, (payload) => {
      const event = payload as SosProgressEvent;
      if (event.sos_id !== sessionIdRef.current) return;
      setProgress(event);
    });

    const unsubscribeLocation = socketClient.on(SOS_EVENTS.volunteerLocationUpdate, (payload) => {
      const event = payload as VolunteerLocationUpdateEvent;
      if (event.sos_id !== sessionIdRef.current) return;
      setVolunteerLocations((current) => [
      ...current.filter((item) => item.volunteer_id !== event.volunteer_id),
      event]
      );
    });

    const unsubscribeStatus = socketClient.on(SOS_EVENTS.statusChange, (payload) => {
      const event = payload as SosStatusChangeEvent;
      if (event.sos_id !== sessionIdRef.current) return;
      setSession((current) => current ? { ...current, status: event.status, updated_at: event.changed_at } : current);
      if (event.status === 'cancelled' || event.status === 'resolved') setPhase('idle');
    });

    return () => {
      unsubscribeProgress();
      unsubscribeLocation();
      unsubscribeStatus();
    };
  }, []);

  const sendSos = useCallback(async () => {
    if (env.SOS_DISABLED_FOR_TESTING) return;

    setPhase('sending');
    try {
      const nextSession = await triggerSosService(location, user?.account_id ?? 'RM-GUEST01');
      if (nextSession.status === 'disabled') {
        setPhase('idle');
        return;
      }
      sessionIdRef.current = nextSession.sos_id;
      setSession(nextSession);
      setVolunteerLocations([]);
      setProgress(null);
      setPhase('active');
      setFailureOpen(false);
      setErrorType(null);
      setNoticeOpen(true);
    } catch (reason) {
      // Every SOS failure, whatever its type, uses the SOS colour scheme only.
      setErrorType(toAppError(reason).type);
      setPhase('failed');
      setFailureOpen(true);
    }
  }, [location, user?.account_id]);

  const cancelSos = useCallback(async () => {
    const sosId = sessionIdRef.current;
    if (!sosId) return;
    try {
      const cancelled = await cancelSosService(sosId);
      sessionIdRef.current = null;
      setSession(cancelled);
      setVolunteerLocations([]);
      setProgress(null);
      setPhase('idle');
      setErrorType(null);
    } catch (reason) {
      setErrorType(toAppError(reason).type);
      setPhase('failed');
      setFailureOpen(true);
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    const sosId = sessionIdRef.current;
    if (!sosId) return;
    try {
      setSession(await getSosStatusService(sosId));
    } catch (reason) {
      setErrorType(toAppError(reason).type);
    }
  }, []);

  return {
    phase,
    session,
    progress,
    volunteerLocations,
    isSending: phase === 'sending',
    isActive: phase === 'active',
    isSosDisabled: env.SOS_DISABLED_FOR_TESTING,
    failureOpen,
    noticeOpen,
    errorType,
    sendSos,
    cancelSos,
    refreshStatus,
    dismissFailure: useCallback(() => {
      setFailureOpen(false);
      setErrorType(null);
      setPhase('idle');
    }, []),
    dismissNotice: useCallback(() => setNoticeOpen(false), [])
  };
}