import React from 'react';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { helpTypes } from '../../data/helpTypes';
import { ActiveHelpSession } from '../../types/volunteer';

interface ActiveSessionBannerProps {
  session: ActiveHelpSession;
  onEndSession: () => void;
}

export function ActiveSessionBanner({ session, onEndSession }: ActiveSessionBannerProps) {
  const helpType = helpTypes.find((option) => option.id === session.helpType);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        borderWidth: 2,
        borderColor: 'success.main',
        bgcolor: (theme) => alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.14 : 0.08)
      }}>
      
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <Box
            aria-hidden="true"
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 44,
              height: 44,
              flexShrink: 0,
              borderRadius: '50%',
              bgcolor: 'success.main',
              color: 'success.contrastText'
            }}>
            
            <VolunteerActivismRoundedIcon />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Chip label="Sedang Membantu" size="small" color="success" sx={{ fontWeight: 800, mb: 0.5 }} />
            <Typography variant="body1" noWrap sx={{ fontWeight: 800 }}>
              {session.seekerName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {helpType?.title ?? 'Bantuan ringan'} · {session.distanceMeters} m · mulai {session.startedAtLabel}
            </Typography>
          </Box>
        </Stack>
        <Button variant="outlined" color="primary" onClick={onEndSession} sx={{ flexShrink: 0, minHeight: 48 }}>
          Selesaikan Bantuan
        </Button>
      </Stack>
    </Paper>);

}