import React from 'react';
import { Paper, Skeleton, Stack } from '@mui/material';

export function ProfessionalDetailSkeleton() {
  return (
    <Stack role="status" aria-label="Memuat profil mitra profesional" spacing={2.5}>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Skeleton variant="rectangular" width="100%" sx={{ height: { xs: 270, sm: 390 } }} />
        <Stack spacing={1} sx={{ p: { xs: 2, sm: 3 } }}>
          <Skeleton variant="text" width="52%" height={42} />
          <Skeleton variant="text" width="68%" height={25} />
          <Skeleton variant="rounded" width={150} height={28} />
          <Skeleton variant="text" width="35%" height={32} />
        </Stack>
      </Paper>
      {Array.from({ length: 3 }).map((_, index) =>
      <Paper key={index} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
          <Skeleton variant="text" width="42%" height={32} />
          <Skeleton variant="text" width="100%" height={24} />
          <Skeleton variant="text" width="88%" height={24} />
          {index > 0 && <Skeleton variant="text" width="72%" height={24} />}
        </Paper>
      )}
    </Stack>);

}