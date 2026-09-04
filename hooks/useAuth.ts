import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

import { env } from '../config/env';
import { authService, getAuthSnapshot, subscribeToAuth } from '../services/authService';
import { AuthResult, RegisterPayload } from '../types/auth';
import { errorMessage } from '../utils/errorPresentation';

interface UseAuthValue {
  user: ReturnType<typeof getAuthSnapshot>;
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (payload: RegisterPayload) => Promise<AuthResult>;
  logout: () => Promise<AuthResult>;
  updateUsername: (newUsername: string) => Promise<AuthResult>;
  clearError: () => void;
}

let hydrationPromise: Promise<ReturnType<typeof getAuthSnapshot>> | null = null;

function hydrateCurrentUser(): Promise<ReturnType<typeof getAuthSnapshot>> {
  if (!hydrationPromise) hydrationPromise = authService.getCurrentUser();
  return hydrationPromise;
}

export function useAuth(): UseAuthValue {
  const user = useSyncExternalStore(subscribeToAuth, getAuthSnapshot, () => null);
  const [isLoading, setIsLoading] = useState(!env.USE_MOCK_DATA);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (env.USE_MOCK_DATA) return;

    let active = true;
    setIsLoading(true);
    hydrateCurrentUser().
    catch((reason: unknown) => {
      if (active) setError(errorMessage(reason, 'Sesi akun gagal dimuat.'));
    }).
    finally(() => {
      if (active) setIsLoading(false);
    });
    return () => {active = false;};
  }, []);

  const run = useCallback(async (operation: () => Promise<AuthResult>): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await operation();
      if (!result.success) setError(result.message);
      return result;
    } catch (reason) {
      const message = errorMessage(reason, 'Terjadi kesalahan. Silakan coba lagi.');
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isGuest: user === null,
    isLoading,
    error,
    login: useCallback((email, password) => run(() => authService.login(email, password)), [run]),
    register: useCallback((payload) => run(() => authService.register(payload)), [run]),
    logout: useCallback(() => run(() => authService.logout()), [run]),
    updateUsername: useCallback((newUsername) => run(() => authService.updateUsername(newUsername)), [run]),
    clearError: useCallback(() => setError(null), [])
  };
}