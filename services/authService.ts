import { env } from '../config/env';
import { AuthResult, AuthUser, RegisterPayload, UserRole, UserStatus } from '../types/auth';
import { formatAccountId } from '../utils/accountId';
import {
  apiClient,
  isAppError,
  resolveWithMock,
  setAuthTokenProvider,
  setUnauthorizedHandler } from
'./apiClient';

interface StoredAccount {
  user: AuthUser;
  password: string;
}

interface AuthApiResponse {
  user: AuthUser;
  access_token?: string;
  refresh_token?: string;
}

type AuthListener = () => void;

const ACCOUNTS_KEY = 'rangkulmap.auth.accounts.v2';
const SESSION_KEY = 'rangkulmap.auth.session.v2';
const LEGACY_ACCOUNTS_KEY = 'rangkulmap.auth.accounts';
const LEGACY_SESSION_KEY = 'rangkulmap.auth.session';
const USERNAME_PATTERN = /^[a-zA-Z0-9._]+$/;

const mockAccounts: StoredAccount[] = [
{
  user: {
    account_id: 'RM-SKR0001',
    username: 'maya.rangkul',
    email: 'maya@rangkulmap.id',
    role: 'seeker',
    status: 'active',
    display_name: 'Maya Pratama',
    needs: ['Mobilitas & kursi roda'],
    emergency_contact: 'Budi · 0812-0000-1001'
  },
  password: 'Rangkul123'
},
{
  user: {
    account_id: 'RM-VOL0001',
    username: 'dimas.siap',
    email: 'dimas@rangkulmap.id',
    role: 'volunteer',
    status: 'active',
    display_name: 'Dimas Saputra',
    domicile: 'Gondokusuman, Yogyakarta'
  },
  password: 'Rangkul123'
},
{
  user: {
    account_id: 'RM-PRO0001',
    username: 'dr.nadira',
    email: 'nadira@rangkulmap.id',
    role: 'professional',
    status: 'active',
    display_name: 'dr. Nadira Putri',
    license_number: 'STR-33.71.1.2025.0012',
    specialization: 'Fisioterapi',
    hourly_rate: 175000,
    domicile: 'Yogyakarta'
  },
  password: 'Rangkul123'
}];


const listeners = new Set<AuthListener>();
let currentUser: AuthUser | null = readInitialUser();

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function writeString(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function removeItem(key: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

function setCurrentUser(user: AuthUser | null): void {
  currentUser = user;
  notify();
}

function normalizeRole(value: unknown): UserRole {
  return value === 'volunteer' || value === 'professional' ? value : 'seeker';
}

function normalizeStatus(value: unknown, role: UserRole): UserStatus {
  if (value === 'active' || value === 'pending_verification' || value === 'suspended') return value;
  return role === 'seeker' ? 'active' : 'pending_verification';
}

function migrateLegacyUser(account: Record<string, unknown>): AuthUser | null {
  const username = typeof account.username === 'string' ? account.username : '';
  const email = typeof account.identifier === 'string' ? account.identifier : '';
  if (!username || !email) return null;

  const role = normalizeRole(account.role);
  const seed = typeof account.id === 'string' ? account.id : `${username}-${email}`;
  return {
    account_id: typeof account.accountId === 'string' ? account.accountId : formatAccountId(seed),
    username,
    email,
    role,
    status: normalizeStatus(account.status, role),
    display_name: typeof account.name === 'string' ? account.name : username,
    avatar_url: typeof account.avatarUrl === 'string' ? account.avatarUrl : undefined,
    needs: Array.isArray(account.needs) ? account.needs.filter((item): item is string => typeof item === 'string') : undefined,
    emergency_contact: typeof account.emergencyContact === 'string' ? account.emergencyContact : undefined,
    domicile: typeof account.domicile === 'string' ? account.domicile : undefined
  };
}

function readInitialUser(): AuthUser | null {
  const storedUser = readJson<AuthUser | null>(SESSION_KEY, null);
  if (storedUser) return storedUser;

  const legacySession = readJson<Record<string, unknown> | null>(LEGACY_SESSION_KEY, null);
  if (!legacySession) return null;
  const migratedUser = migrateLegacyUser(legacySession);
  if (migratedUser && writeJson(SESSION_KEY, migratedUser)) removeItem(LEGACY_SESSION_KEY);
  return migratedUser;
}

function migrateLegacyAccounts(): StoredAccount[] {
  const legacy = readJson<Array<Record<string, unknown>>>(LEGACY_ACCOUNTS_KEY, []);
  return legacy.flatMap((account) => {
    const password = typeof account.password === 'string' ? account.password : '';
    const user = migrateLegacyUser(account);
    return password && user ? [{ password, user }] : [];
  });
}

function readAccounts(): StoredAccount[] {
  const stored = readJson<StoredAccount[]>(ACCOUNTS_KEY, []);
  if (stored.length > 0) return stored;

  const migrated = migrateLegacyAccounts();
  if (migrated.length > 0) {
    writeJson(ACCOUNTS_KEY, migrated);
    removeItem(LEGACY_ACCOUNTS_KEY);
    return migrated;
  }
  return mockAccounts;
}

function saveTokens(response: AuthApiResponse): void {
  if (response.access_token) writeString(env.AUTH_TOKEN_STORAGE_KEY, response.access_token);
  if (response.refresh_token) writeString(env.AUTH_REFRESH_TOKEN_STORAGE_KEY, response.refresh_token);
}

function createAccountId(seed: string): string {
  return formatAccountId(`${seed}-${Date.now()}-${Math.random()}`);
}

async function loginMock(email: string, password: string): Promise<AuthResult> {
  const identifier = email.trim().toLowerCase();
  const account = readAccounts().find(
    (item) =>
    (item.user.email.toLowerCase() === identifier || item.user.username.toLowerCase() === identifier) &&
    item.password === password
  );

  if (!account) return { success: false, message: 'Email/username atau password belum cocok.' };
  if (account.user.status === 'suspended') return { success: false, message: 'Akun sedang ditangguhkan.' };
  if (!writeJson(SESSION_KEY, account.user)) return { success: false, message: 'Sesi belum dapat disimpan di perangkat.' };

  setCurrentUser(account.user);
  return { success: true, message: 'Berhasil masuk.' };
}

async function registerMock(payload: RegisterPayload): Promise<AuthResult> {
  const accounts = readAccounts();
  const email = payload.email.trim().toLowerCase();
  const username = payload.username.trim();

  if (accounts.some((item) => item.user.email.toLowerCase() === email || item.user.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, message: 'Email atau username sudah digunakan.' };
  }
  if (!USERNAME_PATTERN.test(username)) {
    return { success: false, message: 'Username hanya boleh berisi huruf, angka, titik, dan garis bawah.' };
  }

  const user: AuthUser = {
    account_id: createAccountId(`${email}-${username}`),
    username,
    email: payload.email.trim(),
    role: payload.role,
    status: payload.role === 'seeker' ? 'active' : 'pending_verification',
    display_name: payload.display_name.trim(),
    avatar_url: payload.avatar_url,
    needs: payload.needs,
    emergency_contact: payload.emergency_contact?.trim(),
    domicile: payload.domicile?.trim(),
    license_number: payload.license_number?.trim(),
    specialization: payload.specialization?.trim(),
    hourly_rate: payload.hourly_rate,
    verification_documents: payload.verification_documents
  };
  const nextAccounts = [...accounts, { user, password: payload.password }];

  if (!writeJson(ACCOUNTS_KEY, nextAccounts)) return { success: false, message: 'Akun belum dapat disimpan di perangkat.' };
  if (!writeJson(SESSION_KEY, user)) {
    writeJson(ACCOUNTS_KEY, accounts);
    return { success: false, message: 'Sesi akun belum dapat disimpan di perangkat.' };
  }

  setCurrentUser(user);
  return { success: true, message: 'Akun berhasil dibuat.' };
}

async function loginLive(email: string, password: string): Promise<AuthResult> {
  const response = await apiClient.post<AuthApiResponse>('/auth/login', { email, password }, { skipAuth: true });
  saveTokens(response);
  writeJson(SESSION_KEY, response.user);
  setCurrentUser(response.user);
  return { success: true, message: 'Berhasil masuk.' };
}

async function registerLive(payload: RegisterPayload): Promise<AuthResult> {
  const response = await apiClient.post<AuthApiResponse>('/auth/register', payload, { skipAuth: true });
  saveTokens(response);
  writeJson(SESSION_KEY, response.user);
  setCurrentUser(response.user);
  return { success: true, message: 'Akun berhasil dibuat.' };
}

export function login(email: string, password: string): Promise<AuthResult> {
  return resolveWithMock(() => loginMock(email, password), () => loginLive(email, password));
}

export function register(payload: RegisterPayload): Promise<AuthResult> {
  return resolveWithMock(() => registerMock(payload), () => registerLive(payload));
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  return resolveWithMock(
    () => currentUser,
    async () => {
      let token: string | null = null;
      try {
        token = typeof window === 'undefined' ? null : window.localStorage.getItem(env.AUTH_TOKEN_STORAGE_KEY);
      } catch {
        token = null;
      }
      if (!token) {
        setCurrentUser(null);
        return null;
      }

      try {
        const user = await apiClient.get<AuthUser>('/auth/me');
        writeJson(SESSION_KEY, user);
        setCurrentUser(user);
        return user;
      } catch (error) {
        if (isAppError(error) && error.status === 401) return null;
        throw error;
      }
    }
  );
}

export async function logout(): Promise<AuthResult> {
  let remoteSucceeded = true;
  if (!env.USE_MOCK_DATA) {
    try {
      await apiClient.post<void>('/auth/logout');
    } catch {
      remoteSucceeded = false;
    }
  }

  const sessionRemoved = removeItem(SESSION_KEY);
  removeItem(LEGACY_SESSION_KEY);
  removeItem(env.AUTH_TOKEN_STORAGE_KEY);
  removeItem(env.AUTH_REFRESH_TOKEN_STORAGE_KEY);
  setCurrentUser(null);
  return {
    success: sessionRemoved && remoteSucceeded,
    message: sessionRemoved && remoteSucceeded ? 'Berhasil keluar.' : 'Sesi lokal belum dapat dibersihkan sepenuhnya.'
  };
}

export async function updateUsername(newUsername: string): Promise<AuthResult> {
  const username = newUsername.trim();
  if (!currentUser) return { success: false, message: 'Masuk dulu untuk mengubah username.' };
  if (username.length < 3 || username.length > 24) return { success: false, message: 'Username harus 3–24 karakter.' };
  if (!USERNAME_PATTERN.test(username)) return { success: false, message: 'Username hanya boleh huruf, angka, titik, dan garis bawah.' };

  if (!env.USE_MOCK_DATA) {
    const user = await apiClient.patch<AuthUser>('/auth/me/username', { username });
    writeJson(SESSION_KEY, user);
    setCurrentUser(user);
    return { success: true, message: 'Username berhasil diperbarui.' };
  }

  const accounts = readAccounts();
  if (accounts.some((item) => item.user.account_id !== currentUser?.account_id && item.user.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, message: 'Username sudah digunakan.' };
  }

  const nextUser = { ...currentUser, username };
  const nextAccounts = accounts.map((item) => item.user.account_id === nextUser.account_id ? { ...item, user: nextUser } : item);
  if (!writeJson(ACCOUNTS_KEY, nextAccounts)) return { success: false, message: 'Username belum dapat disimpan.' };
  if (!writeJson(SESSION_KEY, nextUser)) {
    writeJson(ACCOUNTS_KEY, accounts);
    return { success: false, message: 'Sesi belum dapat diperbarui. Username tidak diubah.' };
  }

  setCurrentUser(nextUser);
  return { success: true, message: 'Username berhasil diperbarui.' };
}

export const authService = {
  login,
  register,
  getCurrentUser,
  logout,
  updateUsername
};

export function getAuthSnapshot(): AuthUser | null {
  return currentUser;
}

export function subscribeToAuth(listener: AuthListener): () => void {
  listeners.add(listener);
  return () => {listeners.delete(listener);};
}

setAuthTokenProvider(() => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(env.AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
});

setUnauthorizedHandler(() => {
  removeItem(SESSION_KEY);
  removeItem(env.AUTH_TOKEN_STORAGE_KEY);
  removeItem(env.AUTH_REFRESH_TOKEN_STORAGE_KEY);
  setCurrentUser(null);
});