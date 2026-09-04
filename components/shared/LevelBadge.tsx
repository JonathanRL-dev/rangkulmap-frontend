import React from 'react';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { Chip } from '@mui/material';

interface LevelBadgeProps {
  level: number;
  levelName?: string;
  size?: 'small' | 'medium';
}

/**
 * Compact gamification level indicator. Shared by relawan and pencari bantuan
 * surfaces, and shown next to the trust badge wherever level data is available.
 */
export function LevelBadge({ level, levelName, size = 'small' }: LevelBadgeProps) {
  return (
    <Chip
      icon={<AutoAwesomeRoundedIcon />}
      label={levelName ? `Level ${level} · ${levelName}` : `Level ${level}`}
      size={size === 'small' ? 'small' : 'medium'}
      color="warning"
      sx={{ minHeight: size === 'small' ? 32 : 36, fontWeight: 700 }} />);


}