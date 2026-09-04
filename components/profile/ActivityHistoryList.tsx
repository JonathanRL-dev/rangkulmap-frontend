import React from 'react';
import AccessibleForwardRoundedIcon from '@mui/icons-material/AccessibleForwardRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import EditLocationAltRoundedIcon from '@mui/icons-material/EditLocationAltRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { ActivityKind, ActivityLogEntry } from '../../types/profile';

interface ActivityHistoryListProps {
  entries: ActivityLogEntry[];
}

export function ActivityHistoryList({ entries }: ActivityHistoryListProps) {
  if (entries.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        Belum ada aktivitas tercatat.
      </Typography>);

  }

  return (
    <Stack component="ul" spacing={1.25} sx={{ listStyle: 'none', p: 0, m: 0 }}>
      {entries.map((entry) =>
      <Paper key={entry.id} component="li" variant="outlined" sx={{ p: 1.75, borderRadius: 2.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
            aria-hidden="true"
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: '50%',
              color: entry.kind === 'sos-cancelled' ? 'text.secondary' : 'primary.main',
              bgcolor: (theme) =>
              alpha(
                entry.kind === 'sos-cancelled' ? theme.palette.text.secondary : theme.palette.primary.main,
                0.12
              )
            }}>
            
              {getActivityIcon(entry.kind)}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {entry.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {entry.detail}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                {entry.timestamp}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}
    </Stack>);

}

function getActivityIcon(kind: ActivityKind): React.ReactNode {
  if (kind === 'volunteer-help') return <VolunteerActivismRoundedIcon />;
  if (kind === 'help-request') return <AccessibleForwardRoundedIcon />;
  if (kind === 'infrastructure') return <EditLocationAltRoundedIcon />;
  if (kind === 'reward') return <CardGiftcardRoundedIcon />;
  return <HistoryRoundedIcon />;
}