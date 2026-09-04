import React from 'react';
import { Box, Paper, Skeleton, Stack } from '@mui/material';

export function ProgressionPageSkeleton() {
  return (
    <Stack role="status" aria-label="Memuat progression level" spacing={2.5}>
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={1} sx={{ flex: 1 }}>
            <Skeleton variant="rounded" width={210} height={30} />
            <Skeleton variant="text" width="72%" height={36} />
            <Skeleton variant="text" width="88%" height={24} />
          </Stack>
          <Skeleton variant="rounded" width={80} height={80} sx={{ display: { xs: 'none', sm: 'block' } }} />
        </Stack>
      </Paper>

      <Stack direction="row" justifyContent="space-between">
        <Box sx={{ width: '55%' }}>
          <Skeleton variant="text" width={140} height={32} />
          <Skeleton variant="text" width={220} height={22} />
        </Box>
        <Skeleton variant="rounded" width={92} height={34} />
      </Stack>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, minHeight: 620 }}>
        <Stack alignItems="center" spacing={3} sx={{ pt: 2 }}>
          {Array.from({ length: 7 }).map((_, index) =>
          <React.Fragment key={index}>
              <Skeleton variant="circular" width={index === 4 ? 62 : 48} height={index === 4 ? 62 : 48} />
              {index < 6 && <Skeleton variant="rounded" width={6} height={38} />}
            </React.Fragment>
          )}
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Skeleton variant="text" width="45%" height={34} />
        <Skeleton variant="text" width="70%" height={24} />
        <Skeleton variant="rounded" width="100%" height={12} sx={{ my: 2 }} />
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rounded" width="50%" height={78} />
          <Skeleton variant="rounded" width="50%" height={78} />
        </Stack>
      </Paper>
    </Stack>);

}