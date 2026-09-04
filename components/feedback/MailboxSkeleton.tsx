import React from 'react';
import { Paper, Skeleton, Stack } from '@mui/material';

export function MailboxSkeleton() {
  return (
    <Stack role="status" aria-label="Memuat hadiah Mailbox" spacing={1.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Skeleton variant="text" width={126} height={34} />
        <Skeleton variant="rounded" width={112} height={28} />
      </Stack>
      {Array.from({ length: 3 }).map((_, index) =>
      <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Skeleton variant="circular" width={46} height={46} sx={{ flexShrink: 0 }} />
            <Stack spacing={0.75} sx={{ flex: 1 }}>
              <Skeleton variant="text" width="62%" height={27} />
              <Skeleton variant="text" width="44%" height={20} />
              <Skeleton variant="text" width="92%" height={22} />
              <Skeleton variant="rounded" width="100%" height={48} sx={{ mt: 0.75 }} />
            </Stack>
          </Stack>
        </Paper>
      )}
    </Stack>);

}