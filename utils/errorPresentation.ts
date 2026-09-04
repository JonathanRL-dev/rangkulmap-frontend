import { AppErrorType, ServiceError, toAppError } from '../services/apiClient';

/** The four presentation patterns the app is allowed to use for failures. */
export type ErrorPattern = 'toast' | 'inline' | 'fullscreen' | 'sos';

/** Where the failure happened, which decides how severe the surface must be. */
export type ErrorContext = 'load' | 'submit' | 'sos';

/**
 * Single mapping from the shared error `type` onto the established display
 * patterns. Every module goes through this so the same failure never looks
 * different on two screens.
 */
export function errorPatternFor(type: AppErrorType, context: ErrorContext): ErrorPattern {
  if (context === 'sos') return 'sos';
  if (context === 'load') return 'fullscreen';
  return type === 'validation' ? 'inline' : 'toast';
}

const TITLES: Record<AppErrorType, string> = {
  network: 'Koneksi terputus',
  validation: 'Data belum lengkap',
  notfound: 'Data tidak ditemukan',
  server: 'Server sedang bermasalah'
};

const DESCRIPTIONS: Record<AppErrorType, string> = {
  network: 'Jaringan sedang tidak stabil. Periksa koneksi lalu coba lagi.',
  validation: 'Periksa kembali data yang dikirim lalu coba lagi.',
  notfound: 'Data yang diminta sudah tidak tersedia. Muat ulang halaman ini.',
  server: 'Kami sedang memperbaikinya. Coba lagi beberapa saat lagi.'
};

export interface ErrorPresentation {
  type: AppErrorType;
  pattern: ErrorPattern;
  title: string;
  description: string;
}

/** Turns any thrown value into consistent title/description copy. */
export function describeError(
error: unknown,
context: ErrorContext = 'submit',
fallbackTitle?: string)
: ErrorPresentation {
  const appError = toAppError(error);
  return {
    type: appError.type,
    pattern: errorPatternFor(appError.type, context),
    title: fallbackTitle ?? TITLES[appError.type],
    description: appError.message || DESCRIPTIONS[appError.type]
  };
}

/** Message helper for hooks that only keep a single error string in state. */
export function errorMessage(error: unknown, fallbackMessage?: string): string {
  const appError = toAppError(error, fallbackMessage);
  return appError.message || fallbackMessage || DESCRIPTIONS[appError.type];
}

export function errorTypeOf(error: unknown): AppErrorType {
  return toAppError(error).type;
}

export type { AppErrorType, ServiceError };