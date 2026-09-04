import React from 'react';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocalActivityRoundedIcon from '@mui/icons-material/LocalActivityRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import {
  Box,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography } from
'@mui/material';
import { alpha } from '@mui/material/styles';

import { ProgressionLevel, VolunteerProgression } from '../../types/progression';

interface ProgressionSummaryProps {
  progression: VolunteerProgression;
  selectedLevel: ProgressionLevel;
}

export function ProgressionSummary({ progression, selectedLevel }: ProgressionSummaryProps) {
  const currentLevel = progression.levels.find((level) => level.level === progression.currentLevel) ?? selectedLevel;
  const nextRewardLevel = progression.levels.
  filter((level) => level.level > progression.currentLevel && level.reward).
  sort((first, second) => first.level - second.level)[0];
  const progressValue = Math.min(100, Math.round(progression.currentXp / progression.xpGoal * 100));
  const selectedStatus =
  selectedLevel.status === 'completed' ? 'Sudah dilewati' : selectedLevel.status === 'current' ? 'Kamu di sini' : 'Belum terbuka';
  const selectedStatusIcon =
  selectedLevel.status === 'completed' ? <CheckCircleRoundedIcon /> : selectedLevel.status === 'current' ? <AutoAwesomeRoundedIcon /> : <LockRoundedIcon />;
  const nextRewardIcon =
  nextRewardLevel?.reward?.type === 'voucher' ?
  <LocalActivityRoundedIcon /> :
  nextRewardLevel?.reward?.type === 'badge' ?
  <WorkspacePremiumRoundedIcon /> :

  <AutoAwesomeRoundedIcon />;


  return (
    <Paper
      component="section"
      aria-labelledby="progression-summary-title"
      elevation={0}
      sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
      
      <Stack spacing={2.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              LEVEL SAAT INI
            </Typography>
            <Typography id="progression-summary-title" component="h2" variant="h2">
              Level {currentLevel.level} · {currentLevel.name}
            </Typography>
          </Box>
          <Chip color="warning" icon={<AutoAwesomeRoundedIcon />} label={`${progressValue}% menuju Level ${progression.currentLevel + 1}`} />
        </Stack>

        <Box>
          <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Progress XP
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
              {progression.currentXp.toLocaleString('id-ID')} / {progression.xpGoal.toLocaleString('id-ID')} XP
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            color="warning"
            value={progressValue}
            aria-label={`Progress ${progression.currentXp} dari ${progression.xpGoal} XP`}
            sx={{ height: 10 }} />
          
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>
            Kurang {(progression.xpGoal - progression.currentXp).toLocaleString('id-ID')} XP lagi untuk naik level.
          </Typography>
        </Box>

        <Divider />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Paper
            variant="outlined"
            sx={{ flex: 1, p: 2, borderRadius: 2.5, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
            
            <Stack direction="row" alignItems="flex-start" spacing={1.5}>
              <Box sx={{ display: 'flex', color: selectedLevel.status === 'locked' ? 'text.secondary' : 'primary.main', mt: 0.25 }}>
                {selectedStatusIcon}
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  LEVEL YANG DIPILIH
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 800 }}>
                  Level {selectedLevel.level} · {selectedLevel.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedStatus}
                  {selectedLevel.reward ? ` · Hadiah: ${selectedLevel.reward.title}` : ' · Tidak ada hadiah khusus'}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {nextRewardLevel?.reward &&
          <Paper
            variant="outlined"
            sx={{ flex: 1, p: 2, borderRadius: 2.5, bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1) }}>
            
              <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                <Box
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: '50%',
                  bgcolor: 'warning.main',
                  color: 'warning.contrastText'
                }}>
                
                  {nextRewardIcon}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    HADIAH TERDEKAT · LEVEL {nextRewardLevel.level}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800 }}>
                    {nextRewardLevel.reward.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {nextRewardLevel.reward.description}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          }
        </Stack>
      </Stack>
    </Paper>);

}