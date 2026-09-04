import React from 'react';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { Chip } from '@mui/material';

interface TrustScoreBadgeProps {
  trustScore: number;
  /** "small" for list cards, "medium" for hero/profile surfaces. */
  size?: 'small' | 'medium';
}

/**
 * Green trust badge shared by relawan and pencari bantuan surfaces so both
 * roles are presented with the same visual weight.
 */
export function TrustScoreBadge({ trustScore, size = 'small' }: TrustScoreBadgeProps) {
  return (
    <Chip
      icon={<ShieldRoundedIcon />}
      label={`Trust Score ${trustScore}`}
      size={size === 'small' ? 'small' : 'medium'}
      variant="outlined"
      sx={{
        minHeight: size === 'small' ? 32 : 42,
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderWidth: 2,
        borderColor: 'success.main',
        fontWeight: size === 'small' ? 700 : 800,
        '& .MuiChip-icon': { color: 'success.main' }
      }} />);


}