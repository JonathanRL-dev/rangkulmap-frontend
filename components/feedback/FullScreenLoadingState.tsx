import React from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';

interface FullScreenLoadingStateProps {
  label: string;
}

/** Blocking loading state used before a critical surface can be shown. */
export function FullScreenLoadingState({ label }: FullScreenLoadingStateProps) {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        display: 'grid',
        placeItems: 'center',
        width: '100%',
        minHeight: '100dvh',
        px: 3,
        bgcolor: 'background.default'
      }}>
      
      <Stack spacing={2} alignItems="center">
        <CircularProgress aria-hidden="true" />
        <Typography variant="body1" color="text.secondary">
          {label}
        </Typography>
      </Stack>
    </Box>);

}