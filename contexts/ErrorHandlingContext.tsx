import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { Alert, AlertTitle, Snackbar, Typography } from '@mui/material';

import { configureErrorSimulation, getErrorSimulation } from '../services/apiClient';
import { ErrorPresentation, describeError } from '../utils/errorPresentation';

interface ErrorToastPayload {
  id: number;
  message: string;
  description?: string;
}

interface ErrorHandlingContextValue {
  /**
   * Transient, recoverable failures (failed report submit, slow connection).
   * Never used for the SOS flow, which has its own high-contrast screen.
   */
  showErrorToast: (message: string, description?: string) => void;
  /**
   * Maps a thrown service error onto the agreed pattern. A toast is shown for
   * network/server/notfound failures; validation failures are returned so the
   * caller can render them inline in its form.
   */
  showServiceError: (error: unknown, title?: string, description?: string) => ErrorPresentation;
  /** Demo switch that lets the prototype exercise every failure path. */
  simulateFailures: boolean;
  /** Random service failures for testing, independent of the demo switch. */
  errorSimulationEnabled: boolean;
  errorSimulationRate: number;
  /** Turns the ~10% random failure generator on/off at runtime. */
  setErrorSimulation: (enabled: boolean, failureRate?: number) => void;
}

const AUTO_DISMISS_MS = 4000;
const ErrorHandlingContext = createContext<ErrorHandlingContextValue | undefined>(undefined);

interface ErrorHandlingProviderProps {
  simulateFailures?: boolean;
  simulateRandomServiceErrors?: boolean;
  children: React.ReactNode;
}

export function ErrorHandlingProvider({
  simulateFailures = false,
  simulateRandomServiceErrors = false,
  children
}: ErrorHandlingProviderProps) {
  const [toast, setToast] = useState<ErrorToastPayload | null>(null);
  const [simulation, setSimulation] = useState(getErrorSimulation);

  useEffect(() => {
    configureErrorSimulation({ enabled: simulateRandomServiceErrors });
    setSimulation(getErrorSimulation());
  }, [simulateRandomServiceErrors]);

  const showErrorToast = useCallback((message: string, description?: string) => {
    setToast({ id: Date.now(), message, description });
  }, []);

  const showServiceError = useCallback((error: unknown, title?: string, description?: string) => {
    const described = describeError(error, 'submit', title);
    const presentation: ErrorPresentation = description ?
    { ...described, description } :
    described;
    if (presentation.pattern === 'toast') {
      showErrorToast(presentation.title, presentation.description);
    }
    return presentation;
  }, [showErrorToast]);

  const setErrorSimulation = useCallback((enabled: boolean, failureRate?: number) => {
    configureErrorSimulation(failureRate === undefined ? { enabled } : { enabled, failureRate });
    setSimulation(getErrorSimulation());
  }, []);

  const value = useMemo<ErrorHandlingContextValue>(
    () => ({
      showErrorToast,
      showServiceError,
      simulateFailures,
      errorSimulationEnabled: simulation.enabled,
      errorSimulationRate: simulation.failureRate,
      setErrorSimulation
    }),
    [setErrorSimulation, showErrorToast, showServiceError, simulateFailures, simulation]
  );

  return (
    <ErrorHandlingContext.Provider value={value}>
      {children}
      <Snackbar
        key={toast?.id}
        open={Boolean(toast)}
        autoHideDuration={AUTO_DISMISS_MS}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setToast(null)}
        sx={{ maxWidth: 480 }}>
        
        <Alert
          severity="error"
          variant="filled"
          icon={<WarningAmberRoundedIcon />}
          onClose={() => setToast(null)}
          sx={{ width: '100%', alignItems: 'flex-start' }}>
          
          <AlertTitle sx={{ mb: toast?.description ? 0.25 : 0, fontWeight: 800 }}>{toast?.message}</AlertTitle>
          {toast?.description && <Typography variant="caption">{toast.description}</Typography>}
        </Alert>
      </Snackbar>
    </ErrorHandlingContext.Provider>);

}

export function useErrorHandling(): ErrorHandlingContextValue {
  const context = useContext(ErrorHandlingContext);
  if (!context) {
    throw new Error('useErrorHandling harus dipakai di dalam ErrorHandlingProvider');
  }
  return context;
}