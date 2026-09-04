import React from 'react';
import { Card, Skeleton, Stack } from '@mui/material';

export function ActiveRequestCardSkeleton() {
  return (
    <Card component="li" variant="outlined" aria-label="Memuat permintaan bantuan" sx={{ borderRadius: 3, p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
        <Stack direction="row" spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="circular" width={56} height={56} sx={{ flexShrink: 0 }} />
          <Stack spacing={0.75} sx={{ flex: 1 }}>
            <Skeleton variant="text" width="48%" height={26} />
            <Skeleton variant="text" width="64%" height={22} />
            <Stack direction="row" spacing={1}>
              <Skeleton variant="rounded" width={116} height={32} />
              <Skeleton variant="rounded" width={82} height={32} />
            </Stack>
            <Skeleton variant="text" width="42%" height={20} />
          </Stack>
        </Stack>
        <Skeleton variant="rounded" width={132} height={48} sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }} />
      </Stack>
    </Card>);

}