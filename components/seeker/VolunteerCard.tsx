import React from 'react';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { Avatar, Badge, Box, ButtonBase, Card, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { TrustScoreBadge } from '../shared/TrustScoreBadge';
import { Volunteer } from '../../types/volunteer';

interface VolunteerCardProps {
  volunteer: Volunteer;
  /** Enables scroll snapping when the card sits in a horizontal carousel. */
  snap?: boolean;
  restricted?: boolean;
  onRestrictedClick?: () => void;
}

export function VolunteerCard({ volunteer, snap = false, restricted = false, onRestrictedClick }: VolunteerCardProps) {
  return (
    <Card
      role="listitem"
      variant="outlined"
      sx={{ position: 'relative', borderRadius: 3, minHeight: 154, overflow: 'hidden', ...(snap ? { scrollSnapAlign: 'start' } : null) }}>
      
      <Stack
        direction="row"
        spacing={1.75}
        alignItems="center"
        aria-hidden={restricted ? 'true' : undefined}
        sx={{ p: 2, filter: restricted ? 'blur(7px)' : 'none', opacity: restricted ? 0.56 : 1, userSelect: restricted ? 'none' : 'auto' }}>
        
        <Badge
          overlap="circular"
          variant="dot"
          color="success"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          aria-label="Sedang aktif"
          sx={{
            flexShrink: 0,
            '& .MuiBadge-badge': {
              width: 17,
              height: 17,
              borderRadius: '50%',
              border: '3px solid',
              borderColor: 'background.paper'
            }
          }}>
          
          <Avatar src={volunteer.imageUrl} alt={`Foto ${volunteer.name}`} sx={{ width: 72, height: 72 }} />
        </Badge>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography component="h3" variant="body1" noWrap sx={{ fontWeight: 700 }}>
            {volunteer.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            {volunteer.availability} · {volunteer.distanceMeters} m
          </Typography>
          <TrustScoreBadge trustScore={volunteer.trustScore} />
        </Box>
      </Stack>

      {restricted &&
      <ButtonBase
        aria-label="Login untuk melihat relawan lainnya"
        onClick={onRestrictedClick}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          minHeight: 154,
          p: 2,
          bgcolor: (theme) => alpha(theme.palette.background.default, 0.38),
          '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: -3 }
        }}>
        
          <Stack alignItems="center" spacing={1} sx={{ maxWidth: 280 }}>
            <Box
            sx={{
              width: 44,
              height: 44,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '50%',
              bgcolor: 'background.paper',
              color: 'primary.main',
              boxShadow: 2
            }}>
            
              <LockRoundedIcon />
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.primary', textAlign: 'center' }}>
              Login untuk melihat relawan lainnya
            </Typography>
          </Stack>
        </ButtonBase>
      }
    </Card>);

}