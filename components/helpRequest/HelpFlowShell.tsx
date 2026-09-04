import React from 'react';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Box, Container, IconButton, LinearProgress, Paper, Stack, Typography } from '@mui/material';

interface HelpFlowShellProps {
  step: number;
  title: string;
  subtitle: string;
  onBack?: () => void;
  onClose: () => void;
  children: React.ReactNode;
}

export function HelpFlowShell({ step, title, subtitle, onBack, onClose, children }: HelpFlowShellProps) {
  return (
    <Box component="main" sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.default' }}>
      <Paper component="header" square elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
            {onBack ?
            <IconButton aria-label="Kembali ke langkah sebelumnya" onClick={onBack}>
                <ArrowBackRoundedIcon />
              </IconButton> :

            <Box sx={{ width: 48, height: 48 }} aria-hidden="true" />
            }
            <Box sx={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                Langkah {step} dari 4
              </Typography>
              <LinearProgress
                variant="determinate"
                value={step * 25}
                aria-label={`Progres langkah ${step} dari 4`}
                sx={{ height: 6, borderRadius: 10, mt: 0.75 }} />
              
            </Box>
            <IconButton aria-label="Tutup alur minta bantuan" onClick={onClose}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </Container>
      </Paper>

      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 4 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography component="h1" variant="h1">
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
            {subtitle}
          </Typography>
        </Box>
        {children}
      </Container>
    </Box>);

}