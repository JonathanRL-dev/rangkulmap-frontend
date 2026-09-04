import React, { createContext, useContext, useMemo } from 'react';

import { useAuth } from '../hooks/useAuth';
import { GamificationStatus, useGamifikasi } from '../hooks/useGamifikasi';
import { MailboxReward } from '../types/mailbox';

interface MailboxContextValue {
  unclaimedRewards: MailboxReward[];
  claimedRewards: MailboxReward[];
  unclaimedCount: number;
  status: GamificationStatus;
  isClaiming: boolean;
  retry: () => void;
  /** False when the claim is invalid or cannot be persisted. */
  claimReward: (level: number) => Promise<boolean>;
}

const MailboxContext = createContext<MailboxContextValue | undefined>(undefined);

/**
 * Compatibility adapter for the existing Mailbox UI. All progression/reward
 * data and claim state now come from useGamifikasi rather than this context.
 */
export function MailboxProvider({ children }: {children: React.ReactNode;}) {
  const { user } = useAuth();
  const {
    unclaimedRewards,
    claimedRewards,
    unclaimedCount,
    status,
    isClaiming,
    retry,
    claimRewardByLevel
  } = useGamifikasi(user?.account_id);

  const value = useMemo<MailboxContextValue>(
    () => ({
      unclaimedRewards: user ? unclaimedRewards : [],
      claimedRewards: user ? claimedRewards : [],
      unclaimedCount: user ? unclaimedCount : 0,
      status,
      isClaiming,
      retry,
      claimReward: async (level) => user ? claimRewardByLevel(level) : false
    }),
    [claimedRewards, claimRewardByLevel, isClaiming, retry, status, unclaimedCount, unclaimedRewards, user]
  );

  return <MailboxContext.Provider value={value}>{children}</MailboxContext.Provider>;
}

export function useMailbox(): MailboxContextValue {
  const context = useContext(MailboxContext);
  if (!context) {
    throw new Error('useMailbox harus dipakai di dalam MailboxProvider');
  }
  return context;
}