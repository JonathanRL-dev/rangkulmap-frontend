import { LevelReward } from './progression';

export interface MailboxReward {
  level: number;
  levelName: string;
  reward: LevelReward;
}

export type ClaimedRewardsByUser = Record<string, number[]>;