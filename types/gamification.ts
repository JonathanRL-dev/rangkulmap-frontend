import {
  LevelReward,
  ProgressionLevel,
  ProgressionZone,
  ProgressionZoneProgress,
  RewardType } from
'./progression';

/** Canonical trust_score_xp record. */
export interface TrustScoreXp {
  user_id: string;
  trust_score: number;
  current_xp: number;
  current_level: number;
  xp_to_next_level: number;
  updated_at: string;
}

/** Canonical badges record. */
export interface Badge {
  badge_id: string;
  name: string;
  description: string;
  unlock_level: number;
}

/** Canonical user_badges record. */
export interface UserBadge {
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

/** Canonical rewards record. */
export interface Reward {
  reward_id: string;
  unlock_level: number;
  type: RewardType;
  title: string;
  description: string;
}

export type UserRewardStatus = 'locked' | 'available' | 'claimed';

/** Canonical user_rewards record. */
export interface UserReward {
  user_id: string;
  reward_id: string;
  status: UserRewardStatus;
  claimed_at: string | null;
  reward: Reward;
}

export interface GamificationProgression {
  trust_score_xp: TrustScoreXp;
  levels: ProgressionLevel[];
  zones: ProgressionZone[];
  zone_progress: ProgressionZoneProgress;
}

export function toLevelReward(reward: Reward): LevelReward {
  return {
    type: reward.type,
    title: reward.title,
    description: reward.description
  };
}