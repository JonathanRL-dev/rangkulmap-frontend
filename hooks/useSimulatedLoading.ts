import { useLayoutEffect, useState } from 'react';

const DEFAULT_LOADING_MS = 1200;

/** Brief, deterministic loading phase for static prototype data. */
export function useSimulatedLoading(delayMs = DEFAULT_LOADING_MS, resetKey?: string | number | boolean): boolean {
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs, resetKey]);

  return loading;
}