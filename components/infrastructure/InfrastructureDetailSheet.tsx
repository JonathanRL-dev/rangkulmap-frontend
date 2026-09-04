import React from 'react';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditLocationAltRoundedIcon from '@mui/icons-material/EditLocationAltRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { Box, Button, Chip, Drawer, IconButton, Stack, Typography } from '@mui/material';

import { InfrastructurePoint } from '../../types/infrastructure';

interface InfrastructureDetailSheetProps {
  point: InfrastructurePoint | null;
  onClose: () => void;
  onConfirmAccurate: (point: InfrastructurePoint) => void;
  onReportChanged: (point: InfrastructurePoint) => void;
  confirming?: boolean;
}

export function InfrastructureDetailSheet({
  point,
  onClose,
  onConfirmAccurate,
  onReportChanged,
  confirming = false
}: InfrastructureDetailSheetProps) {
  return (
    <Drawer
      anchor="bottom"
      open={Boolean(point)}
      onClose={confirming ? undefined : onClose}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: 760,
          mx: 'auto',
          borderRadius: '24px 24px 0 0',
          maxHeight: '88vh'
        }
      }}>
      
      {point &&
      <Box sx={{ p: { xs: 2, sm: 3 }, overflowY: 'auto' }}>
          <Box aria-hidden="true" sx={{ width: 48, height: 5, borderRadius: 10, bgcolor: 'divider', mx: 'auto', mb: 2 }} />
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Detail titik infrastruktur
              </Typography>
              <Typography component="h2" variant="h2">
                {point.name}
              </Typography>
            </Box>
            <IconButton aria-label="Tutup detail titik" onClick={onClose} disabled={confirming}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <Box
          component="img"
          src={point.imageUrl}
          alt={`Foto ${point.name}`}
          sx={{ width: '100%', height: { xs: 190, sm: 260 }, objectFit: 'cover', borderRadius: 3, my: 2 }} />
        

          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
            <Chip
            icon={point.verified ? <ShieldRoundedIcon /> : undefined}
            label={point.verified ? 'Terverifikasi' : 'Belum terverifikasi'}
            variant="outlined"
            sx={{
              minHeight: 40,
              color: 'text.primary',
              borderWidth: 2,
              borderColor: point.verified ? 'success.main' : 'grey.600',
              '& .MuiChip-icon': { color: point.verified ? 'success.main' : 'grey.600' }
            }} />
          
            <Chip label={`Kondisi: ${point.condition}`} variant="outlined" sx={{ minHeight: 40 }} />
          </Stack>

          <Typography variant="body1" sx={{ mb: 0.5 }}>
            {point.description}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {point.address}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
            <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<CheckCircleRoundedIcon />}
            onClick={() => onConfirmAccurate(point)}
            disabled={confirming}
            sx={{ minHeight: 56 }}>
            
              {confirming ? 'Mengirim konfirmasi…' : 'Konfirmasi Masih Akurat'}
            </Button>
            <Button
            fullWidth
            variant="outlined"
            color="primary"
            startIcon={<EditLocationAltRoundedIcon />}
            onClick={() => onReportChanged(point)}
            disabled={confirming}
            sx={{ minHeight: 56 }}>
            
              Laporkan Berubah
            </Button>
          </Stack>
        </Box>
      }
    </Drawer>);

}