import React from 'react';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import LocalActivityRoundedIcon from '@mui/icons-material/LocalActivityRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';

import { RewardType } from '../../types/progression';

interface RewardIconProps {
  type: RewardType;
  fontSize?: 'inherit' | 'small' | 'medium' | 'large';
}

export function RewardIcon({ type, fontSize = 'small' }: RewardIconProps) {
  if (type === 'voucher') return <LocalActivityRoundedIcon aria-hidden="true" fontSize={fontSize} />;
  if (type === 'badge') return <WorkspacePremiumRoundedIcon aria-hidden="true" fontSize={fontSize} />;
  return <AutoAwesomeRoundedIcon aria-hidden="true" fontSize={fontSize} />;
}