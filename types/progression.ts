export type ProgressionStatus = 'completed' | 'current' | 'locked';

export type RewardType = 'voucher' | 'badge' | 'dino-cosmetic';

export type ProgressionZoneAccent = 'success' | 'primary' | 'warning' | 'neutral';

export interface ProgressionZone {
  id: 1 | 2 | 3 | 4;
  name: 'Newbie' | 'Intermediate' | 'Advanced' | 'Expert';
  minLevel: number;
  maxLevel: number;
  accent: ProgressionZoneAccent;
}

export interface ProgressionZoneProgress {
  zone: ProgressionZone;
  nextZone: ProgressionZone | null;
  percent: number;
  levelsRemaining: number;
}

export interface LevelReward {
  type: RewardType;
  title: string;
  description: string;
}

export interface ProgressionLevel {
  level: number;
  name: string;
  status: ProgressionStatus;
  reward?: LevelReward;
}

export interface VolunteerProgression {
  currentLevel: number;
  currentXp: number;
  xpGoal: number;
  levels: ProgressionLevel[];
}