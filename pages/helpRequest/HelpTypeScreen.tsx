import React, { useState } from 'react';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion, useReducedMotion } from 'framer-motion';

import { HelpFlowShell } from '../../components/helpRequest/HelpFlowShell';
import { HelpTypeIcon } from '../../components/helpRequest/HelpTypeIcon';
import { helpTypes } from '../../data/helpTypes';
import { HelpTypeId } from '../../types/helpRequest';

const MAX_DESCRIPTION_LENGTH = 300;
const MIN_DESCRIPTION_LENGTH = 10;

interface HelpTypeScreenProps {
  selectedType: HelpTypeId | null;
  description: string;
  onSelectType: (type: HelpTypeId) => void;
  onDescriptionChange: (description: string) => void;
  onContinue: () => void;
  onClose: () => void;
}

export function HelpTypeScreen({
  selectedType,
  description,
  onSelectType,
  onDescriptionChange,
  onContinue,
  onClose
}: HelpTypeScreenProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [describing, setDescribing] = useState(false);

  const handleSelect = (type: HelpTypeId) => {
    onSelectType(type);
    if (type === 'other') {
      setDescribing(true);
    }
  };

  const motionProps = {
    component: motion.div,
    initial: reduceMotion ? false : { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] as const }
  };

  if (describing) {
    const trimmedLength = description.trim().length;
    const canContinue = trimmedLength >= MIN_DESCRIPTION_LENGTH;

    return (
      <HelpFlowShell
        step={1}
        title="Jelaskan bantuan yang Anda butuhkan"
        subtitle="Tulis detail singkat agar relawan tahu apa yang perlu disiapkan."
        onBack={() => setDescribing(false)}
        onClose={onClose}>
        
        <Stack {...motionProps} spacing={2.5}>
          <TextField
            label="Deskripsi bantuan"
            multiline
            minRows={5}
            autoFocus
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="Contoh: saya butuh bantuan mengambil barang di lantai 2 gedung..."
            inputProps={{ maxLength: MAX_DESCRIPTION_LENGTH }}
            helperText={`${description.length}/${MAX_DESCRIPTION_LENGTH} karakter · minimal ${MIN_DESCRIPTION_LENGTH} karakter`}
            fullWidth />
          
          <Button
            fullWidth
            variant="contained"
            size="large"
            endIcon={<NavigateNextRoundedIcon />}
            disabled={!canContinue}
            onClick={onContinue}
            sx={{ minHeight: 60, borderRadius: 3 }}>
            
            Lanjutkan ke Lokasi
          </Button>
        </Stack>
      </HelpFlowShell>);

  }

  return (
    <HelpFlowShell
      step={1}
      title="Bantuan apa yang Anda butuhkan?"
      subtitle="Pilih satu jenis bantuan agar kami dapat mencari relawan yang tepat."
      onClose={onClose}>
      
      <Box
        {...motionProps}
        sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: { xs: 1.5, sm: 2 } }}>
        
        {helpTypes.map((option) => {
          const selected = selectedType === option.id;
          return (
            <Button
              key={option.id}
              variant="outlined"
              aria-pressed={selected}
              onClick={() => handleSelect(option.id)}
              sx={{
                position: 'relative',
                minHeight: { xs: 188, sm: 220 },
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                borderWidth: selected ? 3 : 1,
                borderColor: selected ? 'primary.main' : 'divider',
                bgcolor: selected ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08) : 'background.paper',
                color: 'text.primary',
                textAlign: 'left',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                '&:hover': {
                  borderWidth: selected ? 3 : 2,
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.06)
                }
              }}>
              
              <Stack alignItems="flex-start" spacing={1.5} sx={{ width: '100%' }}>
                <Box sx={{ color: 'primary.main', display: 'flex' }}>
                  <HelpTypeIcon type={option.id} />
                </Box>
                <Box>
                  <Typography component="h2" variant="h3" sx={{ mb: 0.5 }}>
                    {option.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.description}
                  </Typography>
                </Box>
              </Stack>
              {selected &&
              <CheckCircleRoundedIcon
                aria-label="Dipilih"
                color="primary"
                sx={{ position: 'absolute', top: 12, right: 12, fontSize: 28 }} />

              }
            </Button>);

        })}
      </Box>

      <Button
        fullWidth
        variant="contained"
        size="large"
        endIcon={<NavigateNextRoundedIcon />}
        disabled={!selectedType}
        onClick={onContinue}
        sx={{ minHeight: 60, mt: 3, borderRadius: 3 }}>
        
        Lanjutkan ke Lokasi
      </Button>
    </HelpFlowShell>);

}