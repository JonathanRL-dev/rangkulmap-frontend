import React from 'react';
import CloudOffRoundedIcon from '@mui/icons-material/CloudOffRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { Box, Button, Stack, Typography } from '@mui/material';

interface FullScreenErrorStateProps {
  title: string;
  description: string;
  onRetry: () => void;
  retryLabel?: string;
  /** Optional escape hatch, e.g. back to the dashboard. */
  secondaryAction?: React.ReactNode;
}

/** Blocking state for critical failures: map, GPS, or volunteer list unavailable. */
export function FullScreenErrorState({
  title,
  description,
  onRetry,
  retryLabel = 'Coba Lagi',
  secondaryAction
}: FullScreenErrorStateProps) {
  return (
    <Box
      role="alert"
      sx={{
        display: 'grid',
        placeItems: 'center',
        width: '100%',
        minHeight: '100dvh',
        px: { xs: 3, sm: 4 },
        py: 6,
        bgcolor: 'background.default'
      }}>
      
      <Stack spacing={2.5} alignItems="center" sx={{ maxWidth: 440, textAlign: 'center' }}>
        <Box
          aria-hidden="true"
          sx={{
            display: 'grid',
            placeItems: 'center',
            width: 88,
            height: 88,
            borderRadius: '50%',
            color: 'text.secondary',
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider'
          }}>
          
          <CloudOffRoundedIcon sx={{ fontSize: 44 }} />
        </Box>

        <Box>
          <Typography component="h1" variant="h2">
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {description}
          </Typography>
        </Box>

        <Stack spacing={1.25} sx={{ width: '100%', pt: 1 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<RefreshRoundedIcon />}
            onClick={onRetry}
            sx={{ minHeight: 64, borderRadius: 3, fontSize: '1.0625rem' }}>
            
            {retryLabel}
          </Button>
          {secondaryAction}
        </Stack>
      </Stack>
    </Box>);

}