import React from 'react';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import WifiOffRoundedIcon from '@mui/icons-material/WifiOffRounded';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';

interface InlineResourceErrorProps {
  title: string;
  description: string;
  onRetry: () => void;
}

/** Recoverable load failure for drawers and dashboard panels that should not replace the whole page. */
export function InlineResourceError({ title, description, onRetry }: InlineResourceErrorProps) {
  return (
    <Paper role="alert" variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderColor: 'error.main' }}>
      <Stack spacing={1.5} alignItems="flex-start">
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box sx={{ display: 'flex', color: 'error.main', mt: 0.25 }}>
            <WifiOffRoundedIcon aria-hidden="true" />
          </Box>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {description}
            </Typography>
          </Box>
        </Stack>
        <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={onRetry} sx={{ minHeight: 48 }}>
          Coba Lagi
        </Button>
      </Stack>
    </Paper>);

}