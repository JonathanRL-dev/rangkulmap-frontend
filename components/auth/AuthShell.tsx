import React from 'react';
import AccessibilityNewRoundedIcon from '@mui/icons-material/AccessibilityNewRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Box, Container, IconButton, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

interface AuthShellProps {
  activeTab: 'signin' | 'signup';
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthShell({ activeTab, title, subtitle, children }: AuthShellProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleTabChange = (_event: React.SyntheticEvent, value: 'signin' | 'signup') => {
    navigate(value === 'signin' ? '/masuk' : '/daftar');
  };

  return (
    <Box component="main" sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, md: 5 } }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: { xs: 2, md: 3 } }}>
          <IconButton aria-label="Kembali ke Dashboard" onClick={() => navigate('/dashboard')}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 40,
                height: 40,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 2.5,
                bgcolor: 'primary.main',
                color: 'primary.contrastText'
              }}>
              
              <AccessibilityNewRoundedIcon />
            </Box>
            <Typography variant="h3">RangkulMap</Typography>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(260px, 0.72fr) minmax(480px, 1.28fr)' },
            gap: { xs: 2, md: 3 },
            alignItems: 'stretch'
          }}>
          
          <Paper
            component="section"
            variant="outlined"
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 620,
              p: 4,
              overflow: 'hidden',
              bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.12 : 0.16),
              borderColor: alpha(theme.palette.warning.main, 0.55)
            }}>
            
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Ruang aman untuk semua
              </Typography>
              <Typography component="h2" variant="h1" sx={{ mt: 1.5, maxWidth: 360 }}>
                Temukan bantuan. Bagikan kepedulian.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: 420 }}>
                Jelajahi peta sebagai Guest atau masuk untuk pengalaman yang lebih personal dan terhubung.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              {[0, 1, 2].map((item) =>
              <Box
                key={item}
                aria-hidden="true"
                sx={{
                  width: item === 1 ? 72 : 54,
                  height: item === 1 ? 72 : 54,
                  borderRadius: item === 2 ? 2 : '50%',
                  bgcolor: item === 1 ? 'primary.main' : item === 2 ? 'success.main' : 'warning.main',
                  opacity: item === 1 ? 1 : 0.75
                }} />

              )}
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="Pilih Masuk atau Daftar"
              sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              
              <Tab value="signin" label="Masuk" />
              <Tab value="signup" label="Daftar" />
            </Tabs>
            <Typography component="h1" variant="h1">
              {title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              {subtitle}
            </Typography>
            {children}
          </Paper>
        </Box>
      </Container>
    </Box>);

}