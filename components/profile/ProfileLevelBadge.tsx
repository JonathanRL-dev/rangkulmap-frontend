import React from 'react';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { Badge, ButtonBase, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface ProfileLevelBadgeProps {
  level: number;
  onOpenProgression: () => void;
}

/**
 * Standalone gamification control. It deliberately contains no account avatar,
 * keeping profile navigation and progression navigation as separate targets.
 */
export function ProfileLevelBadge({ level, onOpenProgression }: ProfileLevelBadgeProps) {
  return (
    <Tooltip title={`Buka Progression Level · Level ${level}`} arrow>
      <ButtonBase
        aria-label={`Buka Progression Level. Level Anda ${level}`}
        onClick={onOpenProgression}
        sx={{
          width: 48,
          height: 48,
          flexShrink: 0,
          overflow: 'visible',
          borderRadius: '50%',
          border: '2px solid',
          borderColor: 'warning.main',
          bgcolor: (theme) => alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.22 : 0.12),
          color: 'warning.main',
          transition: 'box-shadow 180ms ease, transform 180ms ease',
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.3 : 0.18),
            boxShadow: (theme) => `0 0 0 4px ${alpha(theme.palette.warning.main, 0.22)}`,
            transform: 'translateY(-1px)'
          },
          '&:focus-visible': {
            outline: '3px solid',
            outlineColor: 'primary.main',
            outlineOffset: 3
          }
        }}>
        
        <Badge
          badgeContent={level}
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            '& .MuiBadge-badge': {
              right: -3,
              bottom: 1,
              minWidth: 23,
              height: 23,
              px: 0.5,
              borderRadius: 12,
              border: '2px solid',
              borderColor: 'background.paper',
              bgcolor: 'warning.main',
              color: 'warning.contrastText',
              fontSize: '0.6875rem',
              fontWeight: 900,
              lineHeight: 1
            }
          }}>
          
          <WorkspacePremiumRoundedIcon aria-hidden="true" sx={{ fontSize: 29 }} />
        </Badge>
      </ButtonBase>
    </Tooltip>);

}