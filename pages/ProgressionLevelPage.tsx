import React, { useEffect, useState } from 'react';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EggRoundedIcon from '@mui/icons-material/EggRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import { Box, Chip, Container, IconButton, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import { FullScreenErrorState } from '../components/feedback/FullScreenErrorState';
import { ProgressionPageSkeleton } from '../components/feedback/ProgressionPageSkeleton';
import { LevelPath } from '../components/progression/LevelPath';
import { ProgressionSummary } from '../components/progression/ProgressionSummary';
import { ZoneProgressIndicator } from '../components/progression/ZoneProgressIndicator';
import { useAuth } from '../hooks/useAuth';
import { useGamifikasi } from '../hooks/useGamifikasi';

export function ProgressionLevelPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progression, zones, zoneProgress, status, retry } = useGamifikasi(user?.account_id);
  const [selectedLevelNumber, setSelectedLevelNumber] = useState(progression.currentLevel);

  useEffect(() => {
    setSelectedLevelNumber(progression.currentLevel);
  }, [progression.currentLevel]);

  const selectedLevel =
  progression.levels.find((level) => level.level === selectedLevelNumber) ??
  progression.levels.find((level) => level.level === progression.currentLevel) ??
  progression.levels[0];

  if (status === 'error') {
    return (
      <FullScreenErrorState
        title="Gagal memuat Progression Level"
        description="Data level dan hadiah belum dapat diambil. Periksa koneksi lalu coba lagi."
        onRetry={retry} />);


  }

  return (
    <Box component="main" sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.default' }}>
      <Paper component="header" square elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton aria-label="Kembali ke Dashboard" onClick={() => navigate('/dashboard')}>
              <ArrowBackRoundedIcon />
            </IconButton>
            <Box sx={{ minWidth: 0 }}>
              <Typography component="h1" variant="h2">
                Progression Level
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bertumbuh bersama komunitas RangkulMap.
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Paper>

      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 4 } }}>
        {status === 'loading' ?
        <ProgressionPageSkeleton /> :

        <Stack spacing={2.5}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              bgcolor: (theme) => alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.12 : 0.09)
            }}>
            
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Box>
                <Chip icon={<ExploreRoundedIcon />} label="Perjalanan Geo-Friends" color="warning" size="small" />
                <Typography component="h2" variant="h2" sx={{ mt: 1.5 }}>
                  Terus naik, satu aksi baik setiap waktu
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75, maxWidth: 560 }}>
                  Pilih simpul level untuk melihat status dan hadiah. Level yang lebih tinggi berada di bagian atas jalur.
                </Typography>
                <ZoneProgressIndicator progress={zoneProgress} />
              </Box>
              <Box
                role="img"
                aria-label={`Karakter Dino-Square: Level ${progression.currentLevel}, sedang berkembang`}
                sx={{
                  display: { xs: 'none', sm: 'grid' },
                  placeItems: 'center',
                  width: 80,
                  height: 80,
                  flexShrink: 0,
                  borderRadius: 3,
                  border: '3px solid',
                  borderColor: 'warning.main',
                  bgcolor: 'background.paper',
                  color: 'warning.main',
                  transform: 'rotate(3deg)'
                }}>
                
                <EggRoundedIcon sx={{ fontSize: 48 }} />
              </Box>
            </Stack>
          </Paper>

          <Box>
            <Stack direction="row" alignItems="flex-end" justifyContent="space-between" spacing={2} sx={{ mb: 1.25 }}>
              <Box>
                <Typography component="h2" variant="h3">
                  Jalur Level
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hadiah hadir berkala, bukan di setiap level.
                </Typography>
              </Box>
              <Chip label={`Level ${progression.currentLevel} / ${progression.levels.length}`} color="warning" />
            </Stack>
            <LevelPath
              levels={progression.levels}
              zones={zones}
              currentLevel={progression.currentLevel}
              selectedLevel={selectedLevelNumber}
              onSelectLevel={setSelectedLevelNumber} />
            
          </Box>

          <ProgressionSummary progression={progression} selectedLevel={selectedLevel} />
        </Stack>
        }
      </Container>
    </Box>);

}