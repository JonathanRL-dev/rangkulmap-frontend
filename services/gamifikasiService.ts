import { apiClient, createAppError, resolveWithMock } from './apiClient';
import {
  Badge,
  GamificationProgression,
  Reward,
  TrustScoreXp,
  UserBadge,
  UserReward,
  toLevelReward } from
'../types/gamification';
import {
  ProgressionLevel,
  ProgressionZone,
  ProgressionZoneProgress } from
'../types/progression';

const CLAIM_STORAGE_KEY = 'rangkulmap.gamification.claimed-rewards.v1';
export const DEFAULT_GAMIFICATION_USER_ID = 'RM-GUEST01';

type GamificationListener = () => void;
type ClaimedRewardStore = Record<string, Record<string, string>>;

const levelNames = [
'Langkah Pertama',
'Teman Sekitar',
'Penjelajah Ramah',
'Penolong Siaga',
'Rekan Andal',
'Penyambung Asa',
'Sahabat Komunitas',
'Penggerak Baik',
'Pemandu Inklusif',
'Rekan Tangguh',
'Penjaga Rute',
'Penolong Setia',
'Sahabat Akses',
'Juara Inklusi',
'Garda Komunitas',
'Penggerak Kota',
'Pelopor Akses',
'Legenda Rangkul',
'Bintang Kota',
'Geo-Champion'] as
const;

const rewards: Reward[] = [
{
  reward_id: 'reward-level-3-voucher',
  unlock_level: 3,
  type: 'voucher',
  title: 'Voucher Perjalanan 10%',
  description: 'Potongan perjalanan inklusif untuk satu pemesanan.'
},
{
  reward_id: 'reward-level-7-circle-mon',
  unlock_level: 7,
  type: 'badge',
  title: 'Badge Circle-Mon',
  description: 'Badge komunitas untuk profil dan kartu relawan.'
},
{
  reward_id: 'reward-level-10-dino-scarf',
  unlock_level: 10,
  type: 'dino-cosmetic',
  title: 'Syal Penjelajah Dino',
  description: 'Kosmetik syal hangat untuk avatar Dino-Square.'
},
{
  reward_id: 'reward-level-14-voucher',
  unlock_level: 14,
  type: 'voucher',
  title: 'Voucher Layanan 15%',
  description: 'Potongan 15% untuk satu layanan profesional pilihan.'
},
{
  reward_id: 'reward-level-18-dino-armor',
  unlock_level: 18,
  type: 'dino-cosmetic',
  title: 'Armor Dino-Square',
  description: 'Kosmetik armor persegi untuk avatar Dino-Square.'
}];


const badges: Badge[] = [
{
  badge_id: 'badge-circle-mon',
  name: 'Circle-Mon',
  description: 'Badge komunitas untuk anggota yang konsisten membantu sesama.',
  unlock_level: 7
},
{
  badge_id: 'badge-penolong-setia',
  name: 'Penolong Setia',
  description: 'Badge pencapaian untuk perjalanan bantuan tingkat lanjut.',
  unlock_level: 12
}];


const zones: ProgressionZone[] = [
{ id: 1, name: 'Newbie', minLevel: 1, maxLevel: 5, accent: 'success' },
{ id: 2, name: 'Intermediate', minLevel: 6, maxLevel: 10, accent: 'primary' },
{ id: 3, name: 'Advanced', minLevel: 11, maxLevel: 15, accent: 'warning' },
{ id: 4, name: 'Expert', minLevel: 16, maxLevel: 20, accent: 'neutral' }];


const listeners = new Set<GamificationListener>();
let storeVersion = 0;
let claimedRewardStore = readClaimedRewards();

function readClaimedRewards(): ClaimedRewardStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CLAIM_STORAGE_KEY);
    return raw ? JSON.parse(raw) as ClaimedRewardStore : {};
  } catch {
    return {};
  }
}

function persistClaimedRewards(next: ClaimedRewardStore): void {
  if (typeof window === 'undefined') throw createAppError('server', 'Penyimpanan hadiah tidak tersedia.');
  window.localStorage.setItem(CLAIM_STORAGE_KEY, JSON.stringify(next));
}

function notifyStore(): void {
  storeVersion += 1;
  listeners.forEach((listener) => listener());
}

function seedTrustScore(userId: string): number {
  if (userId.includes('VOL')) return 92;
  if (userId.includes('PRO')) return 95;
  return 88;
}

function getMockTrustScoreXp(userId: string): TrustScoreXp {
  return {
    user_id: userId,
    trust_score: seedTrustScore(userId),
    current_xp: 1860,
    current_level: 12,
    xp_to_next_level: 2200,
    updated_at: '2026-01-15T08:00:00.000Z'
  };
}

/** The four-zone calculation is owned exclusively by this service. */
function calculateZoneProgress(record: TrustScoreXp): ProgressionZoneProgress {
  const zone = zones.find(
    (candidate) => record.current_level >= candidate.minLevel && record.current_level <= candidate.maxLevel
  ) ?? zones[zones.length - 1];
  const nextZone = zones.find((candidate) => candidate.id === zone.id + 1) ?? null;

  if (!nextZone) return { zone, nextZone: null, percent: 100, levelsRemaining: 0 };

  const levelsInZone = zone.maxLevel - zone.minLevel + 1;
  const completedLevelsInZone = Math.max(0, record.current_level - zone.minLevel);
  const currentLevelProgress = record.xp_to_next_level > 0 ?
  Math.min(1, Math.max(0, record.current_xp / record.xp_to_next_level)) :
  0;

  return {
    zone,
    nextZone,
    percent: Math.min(100, (completedLevelsInZone + currentLevelProgress) / levelsInZone * 100),
    levelsRemaining: Math.max(0, nextZone.minLevel - record.current_level)
  };
}

function buildLevels(record: TrustScoreXp): ProgressionLevel[] {
  return levelNames.
  map((name, index) => {
    const level = index + 1;
    const reward = rewards.find((item) => item.unlock_level === level);
    return {
      level,
      name,
      status: level < record.current_level ? 'completed' as const : level === record.current_level ? 'current' as const : 'locked' as const,
      reward: reward ? toLevelReward(reward) : undefined
    };
  }).
  reverse();
}

function buildMockProgression(userId: string): GamificationProgression {
  const record = getMockTrustScoreXp(userId);
  return {
    trust_score_xp: record,
    levels: buildLevels(record),
    zones: zones.map((zone) => ({ ...zone })),
    zone_progress: calculateZoneProgress(record)
  };
}

function buildMockRewards(userId: string): UserReward[] {
  const currentLevel = getMockTrustScoreXp(userId).current_level;
  const claimed = claimedRewardStore[userId] ?? {};
  return rewards.map((reward) => ({
    user_id: userId,
    reward_id: reward.reward_id,
    status: claimed[reward.reward_id] ?
    'claimed' :
    reward.unlock_level <= currentLevel ?
    'available' :
    'locked',
    claimed_at: claimed[reward.reward_id] ?? null,
    reward: { ...reward }
  }));
}

export function getProgression(userId: string): Promise<GamificationProgression> {
  return resolveWithMock(
    () => buildMockProgression(userId),
    () => apiClient.get<GamificationProgression>(`/gamification/progression/${encodeURIComponent(userId)}`)
  );
}

export function getBadges(userId: string): Promise<UserBadge[]> {
  return resolveWithMock(
    () => badges.
    filter((badge) => badge.unlock_level <= getMockTrustScoreXp(userId).current_level).
    map((badge) => ({
      user_id: userId,
      badge_id: badge.badge_id,
      earned_at: '2026-01-15T08:00:00.000Z',
      badge: { ...badge }
    })),
    () => apiClient.get<UserBadge[]>(`/gamification/badges/${encodeURIComponent(userId)}`)
  );
}

export function getRewards(userId: string): Promise<UserReward[]> {
  return resolveWithMock(
    () => buildMockRewards(userId),
    () => apiClient.get<UserReward[]>(`/gamification/rewards/${encodeURIComponent(userId)}`)
  );
}

export function claimReward(userId: string, rewardId: string): Promise<UserReward> {
  return resolveWithMock(
    () => {
      const selected = buildMockRewards(userId).find((item) => item.reward_id === rewardId);
      if (!selected || selected.status !== 'available') throw createAppError('validation', 'Hadiah tidak dapat diklaim.');

      const claimedAt = new Date().toISOString();
      const next: ClaimedRewardStore = {
        ...claimedRewardStore,
        [userId]: { ...(claimedRewardStore[userId] ?? {}), [rewardId]: claimedAt }
      };
      persistClaimedRewards(next);
      claimedRewardStore = next;
      notifyStore();
      return { ...selected, status: 'claimed', claimed_at: claimedAt };
    },
    () => apiClient.post<UserReward>(`/gamification/rewards/${encodeURIComponent(rewardId)}/claim`, {
      user_id: userId
    })
  );
}

/** Synchronous mock snapshot prevents profile and top-bar data from flashing. */
export function getGamificationSnapshot(userId = DEFAULT_GAMIFICATION_USER_ID): GamificationProgression {
  return buildMockProgression(userId);
}

export function getRewardsSnapshot(userId = DEFAULT_GAMIFICATION_USER_ID): UserReward[] {
  return buildMockRewards(userId);
}

export function subscribeToGamification(listener: GamificationListener): () => void {
  listeners.add(listener);
  return () => {listeners.delete(listener);};
}

export function getGamificationStoreVersion(): number {
  return storeVersion;
}

export const gamifikasiService = { getProgression, getBadges, getRewards, claimReward };