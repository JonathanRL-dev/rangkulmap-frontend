import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { useErrorHandling } from '../contexts/ErrorHandlingContext';
import {
  DEFAULT_GAMIFICATION_USER_ID,
  claimReward as claimRewardService,
  getBadges,
  getGamificationSnapshot,
  getGamificationStoreVersion,
  getProgression,
  getRewards,
  getRewardsSnapshot,
  subscribeToGamification } from
'../services/gamifikasiService';
import { AppErrorType, createAppError, toAppError } from '../services/apiClient';
import { UserBadge, UserReward } from '../types/gamification';
import { MailboxReward } from '../types/mailbox';
import { ProgressionZone, ProgressionZoneProgress, VolunteerProgression } from '../types/progression';

export type GamificationStatus = 'loading' | 'error' | 'ready';

interface UseGamifikasiValue {
  progression: VolunteerProgression;
  zones: ProgressionZone[];
  zoneProgress: ProgressionZoneProgress;
  trustScore: number;
  badges: UserBadge[];
  rewards: UserReward[];
  unclaimedRewards: MailboxReward[];
  claimedRewards: MailboxReward[];
  unclaimedCount: number;
  status: GamificationStatus;
  error: string | null;
  errorType: AppErrorType | null;
  isClaiming: boolean;
  retry: () => void;
  claimReward: (rewardId: string) => Promise<boolean>;
  claimRewardByLevel: (level: number) => Promise<boolean>;
}

function toProgression(snapshot: ReturnType<typeof getGamificationSnapshot>): VolunteerProgression {
  return {
    currentLevel: snapshot.trust_score_xp.current_level,
    currentXp: snapshot.trust_score_xp.current_xp,
    xpGoal: snapshot.trust_score_xp.xp_to_next_level,
    levels: snapshot.levels
  };
}

function toMailboxReward(item: UserReward): MailboxReward {
  const progression = getGamificationSnapshot(item.user_id);
  const level = progression.levels.find((candidate) => candidate.level === item.reward.unlock_level);
  return {
    level: item.reward.unlock_level,
    levelName: level?.name ?? '',
    reward: {
      type: item.reward.type,
      title: item.reward.title,
      description: item.reward.description
    }
  };
}

export function useGamifikasi(userId?: string | null): UseGamifikasiValue {
  const resolvedUserId = userId ?? DEFAULT_GAMIFICATION_USER_ID;
  const { simulateFailures } = useErrorHandling();
  const storeVersion = useSyncExternalStore(subscribeToGamification, getGamificationStoreVersion, () => 0);
  const initialSnapshot = useMemo(() => getGamificationSnapshot(resolvedUserId), [resolvedUserId]);
  const [progression, setProgression] = useState<VolunteerProgression>(() => toProgression(initialSnapshot));
  const [zones, setZones] = useState<ProgressionZone[]>(initialSnapshot.zones);
  const [zoneProgress, setZoneProgress] = useState<ProgressionZoneProgress>(initialSnapshot.zone_progress);
  const [trustScore, setTrustScore] = useState(initialSnapshot.trust_score_xp.trust_score);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [rewards, setRewards] = useState<UserReward[]>(() => getRewardsSnapshot(resolvedUserId));
  const [status, setStatus] = useState<GamificationStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<AppErrorType | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const resolvedUserRef = useRef<string | null>(null);
  const storeVersionRef = useRef(storeVersion);

  useEffect(() => {
    const snapshot = getGamificationSnapshot(resolvedUserId);
    setProgression(toProgression(snapshot));
    setZones(snapshot.zones);
    setZoneProgress(snapshot.zone_progress);
    setTrustScore(snapshot.trust_score_xp.trust_score);
    setRewards(getRewardsSnapshot(resolvedUserId));
  }, [resolvedUserId]);

  useEffect(() => {
    let active = true;
    const isBackgroundRefresh =
    resolvedUserRef.current === resolvedUserId && storeVersionRef.current !== storeVersion;
    storeVersionRef.current = storeVersion;
    if (!isBackgroundRefresh) setStatus('loading');
    setError(null);

    Promise.all([
    getProgression(resolvedUserId),
    getBadges(resolvedUserId),
    getRewards(resolvedUserId)]
    ).
    then(([nextProgression, nextBadges, nextRewards]) => {
      if (!active) return;
      if (simulateFailures && attempt === 0) throw createAppError('network');
      setProgression(toProgression(nextProgression));
      setZones(nextProgression.zones);
      setZoneProgress(nextProgression.zone_progress);
      setTrustScore(nextProgression.trust_score_xp.trust_score);
      setBadges(nextBadges);
      setRewards(nextRewards);
      resolvedUserRef.current = resolvedUserId;
      setStatus('ready');
    }).
    catch((reason: unknown) => {
      if (!active) return;
      const appError = toAppError(reason, 'Data gamifikasi gagal dimuat.');
      setError(appError.message);
      setErrorType(appError.type);
      setStatus('error');
    });

    return () => {active = false;};
  }, [attempt, resolvedUserId, simulateFailures, storeVersion]);

  const claimReward = useCallback(async (rewardId: string) => {
    setIsClaiming(true);
    setError(null);
    try {
      const claimed = await claimRewardService(resolvedUserId, rewardId);
      setRewards((current) => current.map((item) => item.reward_id === rewardId ? claimed : item));
      return true;
    } catch (reason) {
      const appError = toAppError(reason, 'Hadiah gagal diklaim.');
      setError(appError.message);
      setErrorType(appError.type);
      return false;
    } finally {
      setIsClaiming(false);
    }
  }, [resolvedUserId]);

  const claimRewardByLevel = useCallback(async (level: number) => {
    const item = rewards.find((candidate) => candidate.reward.unlock_level === level);
    return item ? claimReward(item.reward_id) : false;
  }, [claimReward, rewards]);

  const unclaimedRewards = useMemo(
    () => rewards.filter((item) => item.status === 'available').map(toMailboxReward),
    [rewards]
  );
  const claimedRewards = useMemo(
    () => rewards.filter((item) => item.status === 'claimed').reverse().map(toMailboxReward),
    [rewards]
  );

  return {
    progression,
    zones,
    zoneProgress,
    trustScore,
    badges,
    rewards,
    unclaimedRewards,
    claimedRewards,
    unclaimedCount: unclaimedRewards.length,
    status,
    error,
    errorType,
    isClaiming,
    retry: useCallback(() => setAttempt((current) => current + 1), []),
    claimReward,
    claimRewardByLevel
  };
}