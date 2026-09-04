/**
 * Single source of truth for every environment variable used by RangkulMap.
 *
 * Variable names follow the API contract document (Bagian 1 — Environment
 * Variables). The contract file is not part of this project yet, so each entry
 * below carries a safe default that keeps the prototype fully runnable while
 * the real backend is prepared. Nothing outside this file may read
 * `import.meta.env` / `process.env` directly.
 */

type EnvRecord = Record<string, string | undefined>;

function readEnvRecord(): EnvRecord {
  const sources: EnvRecord[] = [];

  try {
    const viteEnv = (import.meta as ImportMeta & {env?: EnvRecord;}).env;
    if (viteEnv) sources.push(viteEnv);
  } catch {

    // import.meta is unavailable in non-module bundles; fall through.
  }
  try {
    const runtime = globalThis as typeof globalThis & {process?: {env?: EnvRecord;};};
    if (runtime.process?.env) sources.push(runtime.process.env);
  } catch {

    // Node-style environment access is unavailable; fall through.
  }
  return sources.reduce<EnvRecord>((merged, source) => ({ ...source, ...merged }), {});
}

const rawEnv = readEnvRecord();

/** Reads a variable, checking both the VITE_ prefixed and bare name. */
function readString(name: string, fallback: string): string {
  const value = rawEnv[`VITE_${name}`] ?? rawEnv[name];
  return value === undefined || value === '' ? fallback : value;
}

function readBoolean(name: string, fallback: boolean): boolean {
  const value = rawEnv[`VITE_${name}`] ?? rawEnv[name];
  if (value === undefined || value === '') return fallback;
  return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function readNumber(name: string, fallback: number): number {
  const value = Number(rawEnv[`VITE_${name}`] ?? rawEnv[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export type AppEnvironment = 'development' | 'staging' | 'production';

export interface AppEnv {
  /** Deployment environment label. */
  APP_ENV: AppEnvironment;
  /** Public application name used in headers and logs. */
  APP_NAME: string;
  /** REST base URL, e.g. https://api.rangkulmap.id/v1 */
  API_BASE_URL: string;
  /** Request timeout in milliseconds before a call is aborted. */
  API_TIMEOUT_MS: number;
  /** Socket.io / WebSocket gateway URL for realtime help requests and SOS. */
  SOCKET_URL: string;
  /** Socket.io handshake path. */
  SOCKET_PATH: string;
  /** Enables the realtime channel. Kept separate from USE_MOCK_DATA. */
  ENABLE_REALTIME: boolean;
  /**
   * Safety switch for testing. While true, triggerSos returns a disabled
   * session immediately and never reaches the API or realtime simulation.
   */
  SOS_DISABLED_FOR_TESTING: boolean;
  /** localStorage key holding the access token attached to every request. */
  AUTH_TOKEN_STORAGE_KEY: string;
  /** localStorage key holding the refresh token. */
  AUTH_REFRESH_TOKEN_STORAGE_KEY: string;
  /** Tile server used by the map surfaces. */
  MAP_TILE_URL: string;
  /**
   * Serve every module from its mock service instead of the network.
   * Default `true`; flip to `false` once the backend is live — no component
   * or hook needs to change.
   */
  USE_MOCK_DATA: boolean;
  /** Artificial latency for mock responses so loading states stay visible. */
  MOCK_LATENCY_MS: number;
  /**
   * Turns the artificial failure generator on. Lets every error surface be
   * verified without waiting for the real backend to fail.
   */
  SIMULATE_ERRORS: boolean;
  /** Chance (0–1) that a single service call fails while simulation is on. */
  SIMULATE_ERROR_RATE: number;
}

export const env: AppEnv = {
  APP_ENV: readString('APP_ENV', 'development') as AppEnvironment,
  APP_NAME: readString('APP_NAME', 'RangkulMap'),
  API_BASE_URL: readString('API_BASE_URL', 'https://api.rangkulmap.local/v1'),
  API_TIMEOUT_MS: readNumber('API_TIMEOUT_MS', 15000),
  SOCKET_URL: readString('SOCKET_URL', 'wss://api.rangkulmap.local'),
  SOCKET_PATH: readString('SOCKET_PATH', '/socket.io'),
  ENABLE_REALTIME: readBoolean('ENABLE_REALTIME', true),
  SOS_DISABLED_FOR_TESTING: readBoolean('SOS_DISABLED_FOR_TESTING', true),
  AUTH_TOKEN_STORAGE_KEY: readString('AUTH_TOKEN_STORAGE_KEY', 'rangkulmap.auth.token'),
  AUTH_REFRESH_TOKEN_STORAGE_KEY: readString('AUTH_REFRESH_TOKEN_STORAGE_KEY', 'rangkulmap.auth.refresh-token'),
  MAP_TILE_URL: readString('MAP_TILE_URL', 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'),
  USE_MOCK_DATA: readBoolean('USE_MOCK_DATA', true),
  MOCK_LATENCY_MS: readNumber('MOCK_LATENCY_MS', 1200),
  SIMULATE_ERRORS: readBoolean('SIMULATE_ERRORS', false),
  SIMULATE_ERROR_RATE: readNumber('SIMULATE_ERROR_RATE', 0.1)
};

/** True while modules should read from their mock service layer. */
export const isMockMode = (): boolean => env.USE_MOCK_DATA;