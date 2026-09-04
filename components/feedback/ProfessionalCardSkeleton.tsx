import React from 'react';
import { Card, Skeleton, Stack } from '@mui/material';

export function ProfessionalCardSkeleton() {
  return (
    <Card variant="outlined" aria-label="Memuat mitra profesional" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Skeleton variant="rectangular" width="100%" sx={{ height: { xs: 168, sm: 190 } }} />
      <Stack spacing={0.75} sx={{ p: { xs: 1.75, sm: 2.25 } }}>
        <Skeleton variant="text" width="66%" height={32} />
        <Skeleton variant="text" width="86%" height={24} />
        <Skeleton variant="rounded" width={138} height={24} />
        <Skeleton variant="text" width="42%" height={26} />
      </Stack>
    </Card>);

}