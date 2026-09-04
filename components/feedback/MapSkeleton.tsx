import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

interface MapSkeletonProps {
  variant?: 'fullscreen' | 'location' | 'dashboard';
  label?: string;
}

export function MapSkeleton({ variant = 'fullscreen', label = 'Memuat peta' }: MapSkeletonProps) {
  const location = variant === 'location';

  return (
    <Box
      role="status"
      aria-label={label}
      sx={{
        position: variant === 'dashboard' ? 'absolute' : 'relative',
        inset: variant === 'dashboard' ? 0 : undefined,
        width: '100%',
        minHeight: location ? { xs: 260, sm: 310 } : '100dvh',
        overflow: 'hidden',
        bgcolor: 'action.hover',
        borderRadius: location ? 3 : 0
      }}>
      
      <Skeleton variant="rectangular" animation="wave" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      {[18, 46, 74].map((top, index) =>
      <Skeleton
        key={top}
        variant="rounded"
        animation="wave"
        sx={{ position: 'absolute', top: `${top}%`, left: '-5%', width: '110%', height: index === 1 ? 22 : 14, transform: `rotate(${index % 2 ? 2 : -2}deg)` }} />

      )}
      {[20, 52, 80].map((left, index) =>
      <Skeleton
        key={left}
        variant="rounded"
        animation="wave"
        sx={{ position: 'absolute', left: `${left}%`, top: '-5%', width: 15, height: '110%', transform: `rotate(${index % 2 ? -4 : 4}deg)` }} />

      )}
      <Stack direction="row" spacing={2} sx={{ position: 'absolute', top: location ? '42%' : '48%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        <Skeleton variant="circular" width={36} height={36} />
        {!location && <Skeleton variant="circular" width={28} height={28} />}
      </Stack>
    </Box>);

}