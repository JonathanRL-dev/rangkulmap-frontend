import React from 'react';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import { Avatar, Box, Button, Card, Divider, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { HelpTypeIcon } from '../helpRequest/HelpTypeIcon';
import { LevelBadge } from '../shared/LevelBadge';
import { TrustScoreBadge } from '../shared/TrustScoreBadge';
import { helpTypes } from '../../data/helpTypes';
import { IncomingHelpRequest } from '../../types/helpRequest';
import { formatWaitingLabel } from '../../utils/waitingTime';

interface IncomingRequestCardProps {
  request: IncomingHelpRequest;
  onAccept: (request: IncomingHelpRequest) => void;
  onDecline: (request: IncomingHelpRequest) => void;
  busy?: boolean;
}

export function IncomingRequestCard({ request, onAccept, onDecline, busy = false }: IncomingRequestCardProps) {
  const helpType = helpTypes.find((option) => option.id === request.helpType);
  const initials = request.seekerName.
  split(' ').
  slice(0, 2).
  map((part) => part[0]).
  join('').
  toUpperCase();

  return (
    <Card component="li" variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.75} alignItems="flex-start">
          <Avatar
            src={request.avatarUrl}
            alt={`Foto ${request.seekerName}`}
            sx={{ width: 64, height: 64, flexShrink: 0, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Pencari Bantuan
            </Typography>
            <Typography component="h3" variant="h3" noWrap>
              {request.seekerName}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              @{request.seekerUsername}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 1 }}>
              <TrustScoreBadge trustScore={request.trustScore} />
              <LevelBadge level={request.level} levelName={request.levelName} />
            </Stack>
          </Box>
        </Stack>

        <Divider />

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            aria-hidden="true"
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 48,
              height: 48,
              flexShrink: 0,
              borderRadius: 2.5,
              color: 'primary.main',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12)
            }}>
            
            <HelpTypeIcon type={request.helpType} fontSize={26} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body1" sx={{ fontWeight: 800 }}>
              {helpType?.title ?? 'Bantuan ringan'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {request.notes}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flex: 1 }}>
            <LocationOnRoundedIcon color="primary" fontSize="small" />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Jarak
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {request.distanceMeters} m
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flex: 1 }}>
            <AccessTimeRoundedIcon color="primary" fontSize="small" />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Menunggu
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {formatWaitingLabel(request.waitingMinutes)}
              </Typography>
            </Box>
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<CheckCircleRoundedIcon />}
            onClick={() => onAccept(request)}
            disabled={busy}
            sx={{ minHeight: 56 }}>
            
            {busy ? 'Mengirim…' : 'Terima Permintaan'}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<CloseRoundedIcon />}
            onClick={() => onDecline(request)}
            disabled={busy}
            sx={{ minHeight: 56 }}>
            
            Lewati
          </Button>
        </Stack>
      </Stack>
    </Card>);

}