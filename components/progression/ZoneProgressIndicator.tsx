import React from 'react';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import { Box, Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { ProgressionZoneProgress } from '../../types/progression';

interface ZoneProgressIndicatorProps {
  progress: ProgressionZoneProgress;
}

export function ZoneProgressIndicator({ progress }: ZoneProgressIndicatorProps) {
  const { zone, nextZone, percent, levelsRemaining } = progress;

  return (
    <Paper
      variant="outlined"
      sx={{
        mt: 2,
        p: 1.5,
        borderRadius: 2.5,
        bgcolor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.7 : 0.86)
      }}>
      
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
        <Chip
          icon={<FlagRoundedIcon />}
          label={`Zona: ${zone.name}`}
          color={zone.accent === 'neutral' ? 'default' : zone.accent}
          variant={zone.accent === 'neutral' ? 'outlined' : 'filled'}
          sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, fontWeight: 800 }} />
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={1}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              {nextZone ? `Menuju Zona ${nextZone.name}` : 'Zona tertinggi telah dicapai'}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              {Math.round(percent)}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={percent}
            aria-label={
            nextZone ?
            `Progres ${Math.round(percent)} persen menuju Zona ${nextZone.name}` :
            'Zona Expert telah dicapai'
            }
            color={zone.accent === 'neutral' ? 'inherit' : zone.accent}
            sx={{
              height: 8,
              mt: 0.5,
              borderRadius: 999,
              ...(zone.accent === 'neutral' ?
              { '& .MuiLinearProgress-bar': { bgcolor: 'text.secondary' } } :
              null)
            }} />
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {nextZone ?
            `${levelsRemaining} level lagi hingga Level ${nextZone.minLevel}` :
            'Anda berada di puncak jalur progression.'}
          </Typography>
        </Box>
      </Stack>
    </Paper>);

}