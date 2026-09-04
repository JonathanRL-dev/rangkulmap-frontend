import React from 'react';
import { Box, Paper, Slider, Stack, Typography } from '@mui/material';

import { TextSizeLevel } from '../../contexts/AccessibilityContext';

const TEXT_SIZE_MARKS = [
{ value: 0, label: 'Kecil' },
{ value: 1, label: 'Sedang' },
{ value: 2, label: 'Besar' },
{ value: 3, label: 'Sangat Besar' }];


interface TextSizeControlProps {
  level: TextSizeLevel;
  onLevelChange: (level: TextSizeLevel) => void;
}

export function TextSizeControl({ level, onLevelChange }: TextSizeControlProps) {
  const currentLabel = TEXT_SIZE_MARKS[level].label;

  return (
    <Stack spacing={2.5}>
      <Box sx={{ px: { xs: 1, sm: 2 } }}>
        <Slider
          value={level}
          onChange={(_event, value) => onLevelChange(value as TextSizeLevel)}
          min={0}
          max={3}
          step={1}
          marks={TEXT_SIZE_MARKS}
          aria-label="Ukuran teks"
          getAriaValueText={(value) => TEXT_SIZE_MARKS[value].label}
          sx={{
            '& .MuiSlider-thumb': { width: 28, height: 28 },
            '& .MuiSlider-markLabel': { fontWeight: 700 }
          }} />
        
      </Box>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: 'background.default' }} aria-live="polite">
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75 }}>
          Pratinjau langsung · {currentLabel}
        </Typography>
        <Typography variant="h3" sx={{ mb: 0.5 }}>
          Relawan Aktif Terdekat
        </Typography>
        <Typography variant="body1">
          Dimas Prasetyo siap membantu Anda menyeberang jalan dalam 4 menit.
        </Typography>
      </Paper>
    </Stack>);

}