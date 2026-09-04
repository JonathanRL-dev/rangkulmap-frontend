import React from 'react';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import { Avatar, Box, Button, Card, Chip, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { HelpTypeIcon } from '../helpRequest/HelpTypeIcon';
import { LevelBadge } from '../shared/LevelBadge';
import { TrustScoreBadge } from '../shared/TrustScoreBadge';
import { helpTypes } from '../../data/helpTypes';
import { IncomingHelpRequest } from '../../types/helpRequest';
import { formatWaitingLabel } from '../../utils/waitingTime';

interface ActiveRequestCardProps {
  request: IncomingHelpRequest;
  onOpen: (request: IncomingHelpRequest) => void;
}

export function ActiveRequestCard({ request, onOpen }: ActiveRequestCardProps) {
  const helpType = helpTypes.find((option) => option.id === request.helpType);
  const initials = request.seekerName.
  split(' ').
  slice(0, 2).
  map((part) => part[0]).
  join('').
  toUpperCase();

  return (
    <Card component="li" variant="outlined" sx={{ borderRadius: 3, p: { xs: 1.75, sm: 2 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.75, sm: 2 }} alignItems={{ sm: 'center' }}>
        <Stack direction="row" spacing={1.75} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
          <Avatar
            src={request.avatarUrl}
            alt={`Foto ${request.seekerName}`}
            sx={{ width: 56, height: 56, flexShrink: 0, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            
            {initials}
          </Avatar>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
              <Typography component="h3" variant="body1" noWrap sx={{ fontWeight: 800 }}>
                {request.seekerName}
              </Typography>
              {request.priority === 'high' &&
              <Chip
                icon={<PriorityHighRoundedIcon />}
                label="Prioritas"
                size="small"
                color="error"
                sx={{ flexShrink: 0, fontWeight: 700 }} />

              }
            </Stack>

            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.5, color: 'primary.main' }}>
              <Box
                aria-hidden="true"
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                  borderRadius: 1.5,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12)
                }}>
                
                <HelpTypeIcon type={request.helpType} fontSize={17} />
              </Box>
              <Typography variant="body2" color="text.primary" noWrap sx={{ fontWeight: 700 }}>
                {helpType?.title ?? 'Bantuan ringan'}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 1 }}>
              <TrustScoreBadge trustScore={request.trustScore} />
              <LevelBadge level={request.level} />
            </Stack>

            <Stack direction="row" spacing={1.5} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 0.5 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <LocationOnRoundedIcon fontSize="small" color="primary" />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {request.distanceMeters} m
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <AccessTimeRoundedIcon fontSize="small" color="primary" />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {formatWaitingLabel(request.waitingMinutes)}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Stack>

        <Button
          variant="contained"
          onClick={() => onOpen(request)}
          sx={{ flexShrink: 0, minHeight: 48, width: { xs: '100%', sm: 'auto' }, whiteSpace: 'nowrap' }}>
          
          Lihat &amp; Terima
        </Button>
      </Stack>
    </Card>);

}