import React from 'react';
import { Card, Skeleton, Stack } from '@mui/material';

interface VolunteerCardSkeletonProps {
  snap?: boolean;
}

export function VolunteerCardSkeleton({ snap = false }: VolunteerCardSkeletonProps) {
  return (
    <Card
      role="listitem"
      variant="outlined"
      aria-label="Memuat data relawan"
      sx={{ borderRadius: 3, minHeight: 154, p: 2, ...(snap ? { scrollSnapAlign: 'start' } : null) }}>
      
      <Stack direction="row" spacing={1.75} alignItems="center">
        <Skeleton variant="circular" width={72} height={72} sx={{ flexShrink: 0 }} />
        <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="text" width="68%" height={28} />
          <Skeleton variant="text" width="52%" height={20} />
          <Skeleton variant="rounded" width={120} height={32} />
        </Stack>
      </Stack>
    </Card>);

}