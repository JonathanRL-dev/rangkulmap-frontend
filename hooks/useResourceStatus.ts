import { useCallback, useLayoutEffect, useState } from 'react';

import { useErrorHandling } from '../contexts/ErrorHandlingContext';
import { deviceIsOffline } from '../services/apiClient';

export type ResourceStatus = 'loading' | 'error' | 'ready';

const RESOURCE_LOADING_MS = 1200;

type AttemptState = {
  key: string | number | boolean | undefined;
  attempt: number;
};

/**
 * Loading/error lifecycle for critical and retryable resources. Every resource
 * identity starts with a skeleton; failure simulation exposes its first error.
 */
export function useResourceStatus(resetKey?: string | number | boolean): {status: ResourceStatus;retry: () => void;} {
  const { simulateFailures } = useErrorHandling();
  const [attemptState, setAttemptState] = useState<AttemptState>({ key: resetKey, attempt: 0 });
  const [status, setStatus] = useState<ResourceStatus>('loading');
  const attempt = Object.is(attemptState.key, resetKey) ? attemptState.attempt : 0;

  useLayoutEffect(() => {
    setStatus('loading');
    setAttemptState((current) =>
    Object.is(current.key, resetKey) ? current : { key: resetKey, attempt: 0 }
    );

    const timer = window.setTimeout(
      () => setStatus(deviceIsOffline() || simulateFailures && attempt === 0 ? 'error' : 'ready'),
      RESOURCE_LOADING_MS
    );
    return () => window.clearTimeout(timer);
  }, [attempt, resetKey, simulateFailures]);

  const retry = useCallback(
    () => setAttemptState({ key: resetKey, attempt: attempt + 1 }),
    [attempt, resetKey]
  );

  return { status, retry };
}