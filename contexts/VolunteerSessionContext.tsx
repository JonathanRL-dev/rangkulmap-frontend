import React, { createContext, useContext, useMemo, useState } from 'react';

import { IncomingHelpRequest } from '../types/helpRequest';
import { ActiveHelpSession } from '../types/volunteer';

interface VolunteerSessionContextValue {
  activeSession: ActiveHelpSession | null;
  /** True while the relawan is in an ongoing "Sedang Membantu" session. */
  isHelping: boolean;
  startSession: (request: IncomingHelpRequest) => boolean;
  endSession: () => boolean;
}

const STORAGE_KEY = 'rangkulmap.volunteer.active-session';
const VolunteerSessionContext = createContext<VolunteerSessionContextValue | undefined>(undefined);

function readSession(): ActiveHelpSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) as ActiveHelpSession : null;
  } catch {
    return null;
  }
}

export function VolunteerSessionProvider({ children }: {children: React.ReactNode;}) {
  const [activeSession, setActiveSession] = useState<ActiveHelpSession | null>(readSession);

  const value = useMemo<VolunteerSessionContextValue>(
    () => ({
      activeSession,
      isHelping: Boolean(activeSession),
      startSession: (request) => {
        if (typeof window === 'undefined') return false;
        const nextSession: ActiveHelpSession = {
          requestId: request.id,
          seekerName: request.seekerName,
          helpType: request.helpType,
          distanceMeters: request.distanceMeters,
          startedAtLabel: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };

        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
          setActiveSession(nextSession);
          return true;
        } catch {
          return false;
        }
      },
      endSession: () => {
        if (typeof window === 'undefined') return false;
        try {
          window.localStorage.removeItem(STORAGE_KEY);
          setActiveSession(null);
          return true;
        } catch {
          return false;
        }
      }
    }),
    [activeSession]
  );

  return <VolunteerSessionContext.Provider value={value}>{children}</VolunteerSessionContext.Provider>;
}

export function useVolunteerSession(): VolunteerSessionContextValue {
  const context = useContext(VolunteerSessionContext);
  if (!context) {
    throw new Error('useVolunteerSession harus dipakai di dalam VolunteerSessionProvider');
  }
  return context;
}