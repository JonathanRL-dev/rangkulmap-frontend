import { env, isMockMode } from '../config/env';

/**
 * Centralised HTTP client for every service file. Modules never call `fetch`
 * directly: they call `apiClient` so the token attachment (request
 * interceptor) and error mapping (response interceptor) stay in one place.
 *
 * Every failure — network drop, 404, 422, 500, timeout, or a mock rejection —
 * leaves this file as the SAME shape: `{ type, message }`. Services must never
 * throw a raw Error; they throw through `createAppError` / `toAppError`.
 */

/** The only error taxonomy the app knows about. */
export type AppErrorType = 'network' | 'validation' | 'notfound' | 'server';

export interface ServiceError {
  type: AppErrorType;
  message: string;
}

export class AppError extends Error implements ServiceError {
  readonly type: AppErrorType;
  readonly status: number | null;
  readonly details: unknown;

  constructor(type: AppErrorType, message: string, status: number | null = null, details: unknown = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.status = status;
    this.details = details;
  }
}

const DEFAULT_MESSAGE: Record<AppErrorType, string> = {
  network: 'Koneksi terputus.',
  validation: 'Data yang dikirim belum valid.',
  notfound: 'Data yang diminta tidak ditemukan.',
  server: 'Server sedang bermasalah.'
};

export function createAppError(
type: AppErrorType,
message: string = DEFAULT_MESSAGE[type],
status: number | null = null,
details: unknown = null)
: AppError {
  return new AppError(type, message, status, details);
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/** Normalises anything thrown anywhere into the shared error shape. */
export function toAppError(error: unknown, fallbackMessage?: string): AppError {
  if (isAppError(error)) return error;
  if (error instanceof Error) {
    return createAppError('server', fallbackMessage ?? error.message, null, error);
  }
  return createAppError('server', fallbackMessage ?? DEFAULT_MESSAGE.server, null, error);
}

type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions {
  /** Query string values; null and undefined entries are dropped. */
  query?: Record<string, QueryValue>;
  /** JSON body. Ignored for GET requests. */
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Skip the Authorization header for public endpoints. */
  skipAuth?: boolean;
  timeoutMs?: number;
}

type TokenProvider = () => string | null;

function defaultTokenProvider(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage.getItem(env.AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

let tokenProvider: TokenProvider = defaultTokenProvider;
let unauthorizedHandler: (() => void) | null = null;

/** Lets the auth layer own where the access token comes from. */
export function setAuthTokenProvider(provider: TokenProvider): void {
  tokenProvider = provider;
}

/** Called whenever the API rejects a request with 401, so the app can sign out. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

/* ------------------------------------------------------------------ *
 * Error simulation (testing aid)
 * ------------------------------------------------------------------ */

export interface ErrorSimulationConfig {
  /** Master switch. While false nothing ever fails artificially. */
  enabled: boolean;
  /** Chance (0–1) that any single service call fails. */
  failureRate: number;
  /** Restrict the simulation to one error type; omit to rotate randomly. */
  forcedType?: AppErrorType;
}

let errorSimulation: ErrorSimulationConfig = {
  enabled: env.SIMULATE_ERRORS,
  failureRate: env.SIMULATE_ERROR_RATE
};

/**
 * Turns artificial failures on/off at runtime so every error surface (toast,
 * inline, full-screen, SOS takeover) can be verified without a real backend.
 */
export function configureErrorSimulation(config: Partial<ErrorSimulationConfig>): void {
  errorSimulation = { ...errorSimulation, ...config };
}

export function getErrorSimulation(): ErrorSimulationConfig {
  return errorSimulation;
}

const SIMULATED_TYPES: AppErrorType[] = ['network', 'server', 'notfound', 'validation'];

/** Throws a simulated AppError based on the current configuration. */
export function maybeSimulateFailure(): void {
  if (!errorSimulation.enabled || errorSimulation.failureRate <= 0) return;
  if (Math.random() >= errorSimulation.failureRate) return;

  const type = errorSimulation.forcedType ??
  SIMULATED_TYPES[Math.floor(Math.random() * SIMULATED_TYPES.length)];
  throw createAppError(type, `${DEFAULT_MESSAGE[type]} (simulasi error)`);
}

/** The device itself reports being offline, so no call can succeed. */
export function deviceIsOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

/* ------------------------------------------------------------------ *
 * Request / response pipeline
 * ------------------------------------------------------------------ */

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const base = env.API_BASE_URL.replace(/\/+$/, '');
  const url = /^https?:\/\//.test(path) ? path : `${base}/${path.replace(/^\/+/, '')}`;
  if (!query) return url;

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') params.append(key, String(value));
  });
  const queryString = params.toString();
  return queryString ? `${url}${url.includes('?') ? '&' : '?'}${queryString}` : url;
}

/** Request interceptor: attaches the access token and shared headers. */
function buildHeaders(options: RequestOptions, hasBody: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Client-App': env.APP_NAME,
    ...options.headers
  };

  if (hasBody) headers['Content-Type'] = 'application/json';

  if (!options.skipAuth) {
    const token = tokenProvider();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/** Maps every HTTP status onto the four shared error types. */
function statusToType(status: number): AppErrorType {
  if (status === 404) return 'notfound';
  if (status === 400 || status === 401 || status === 403 || status === 422) return 'validation';
  if (status >= 500) return 'server';
  return 'server';
}

/** Response interceptor: normalises payloads and maps failures to AppError. */
async function handleResponse<T>(response: Response): Promise<T> {
  const isJson = response.headers.get('content-type')?.includes('application/json') ?? false;
  const payload = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null);

  if (response.ok) return payload as T;

  const type = statusToType(response.status);
  if (response.status === 401) unauthorizedHandler?.();

  const message =
  (payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string' ?
  payload.message :
  null) ?? DEFAULT_MESSAGE[type];

  throw createAppError(type, message, response.status, payload);
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  maybeSimulateFailure();
  if (deviceIsOffline()) throw createAppError('network');

  const hasBody = options.body !== undefined && method !== 'GET';
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? env.API_TIMEOUT_MS;
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const response = await fetch(buildUrl(path, options.query), {
      method,
      headers: buildHeaders(options, hasBody),
      body: hasBody ? JSON.stringify(options.body) : undefined,
      signal: controller.signal
    });
    return await handleResponse<T>(response);
  } catch (error) {
    if (isAppError(error)) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw createAppError('network', 'Permintaan melebihi batas waktu.', null, error);
    }
    throw createAppError('network', DEFAULT_MESSAGE.network, null, error);
  } finally {
    window.clearTimeout(timer);
  }
}

export const apiClient = {
  get: <T,>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T,>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, { ...options, body }),
  patch: <T,>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PATCH', path, { ...options, body }),
  put: <T,>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PUT', path, { ...options, body }),
  delete: <T,>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options)
};

/** Resolves a mock value after the configured latency, so loading states show. */
export function mockResponse<T>(value: T, latencyMs = env.MOCK_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), latencyMs);
  });
}

/**
 * The single switch every service file uses. While `USE_MOCK_DATA` is true the
 * mock factory answers; once the flag flips to false the same call goes to the
 * real endpoint without touching hooks or components. Either way, failures
 * leave here as an `AppError` with one of the four shared types.
 */
export function resolveWithMock<T>(mock: () => T | Promise<T>, live: () => Promise<T>): Promise<T> {
  if (!isMockMode()) return live();

  return mockResponse<void>(undefined).
  then(() => {
    maybeSimulateFailure();
    if (deviceIsOffline()) throw createAppError('network');
    return mock();
  }).
  catch((error: unknown) => {
    throw toAppError(error);
  });
}