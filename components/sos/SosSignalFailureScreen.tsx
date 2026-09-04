import React, { useEffect, useRef } from 'react';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import SignalWifiOffRoundedIcon from '@mui/icons-material/SignalWifiOffRounded';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const EMERGENCY_NUMBER = '112';

interface SosSignalFailureScreenProps {
  onRetry: () => void;
  retrying: boolean;
  onDismiss: () => void;
}

/**
 * SOS failures never use the ordinary Error/Alert toast. This is a high-contrast
 * red-on-black takeover with both actions parked within thumb reach.
 */
export function SosSignalFailureScreen({ onRetry, retrying, onDismiss }: SosSignalFailureScreenProps) {
  const theme = useTheme();
  const callButtonRef = useRef<HTMLAnchorElement | null>(null);
  const sosRed = theme.palette.sos.main;

  useEffect(() => {
    callButtonRef.current?.focus();
  }, []);

  return (
    <Box
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="sos-failure-title"
      aria-describedby="sos-failure-description"
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1400,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#000000',
        color: '#FFFFFF',
        px: { xs: 3, sm: 5 },
        pt: { xs: 5, sm: 7 },
        pb: { xs: 4, sm: 5 },
        overflowY: 'auto'
      }}>
      
      <Stack spacing={2.5} sx={{ flex: 1, maxWidth: 560, mx: 'auto', width: '100%' }}>
        <Box
          aria-hidden="true"
          sx={{
            display: 'grid',
            placeItems: 'center',
            width: 96,
            height: 96,
            borderRadius: '50%',
            bgcolor: sosRed,
            color: '#FFFFFF',
            boxShadow: `0 0 0 8px ${sosRed}33`
          }}>
          
          <SignalWifiOffRoundedIcon sx={{ fontSize: 52 }} />
        </Box>

        <Box>
          <Typography
            variant="caption"
            sx={{ color: sosRed, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            
            SOS GAGAL TERKIRIM
          </Typography>
          <Typography id="sos-failure-title" component="h1" variant="h1" sx={{ mt: 0.5, color: '#FFFFFF' }}>
            Sinyal darurat tidak terkirim
          </Typography>
          <Typography id="sos-failure-description" variant="body1" sx={{ mt: 1.5, color: '#F5F5F5' }}>
            Jaringan sedang tidak tersambung, sehingga relawan dan tim medis belum menerima sinyal Anda. Jangan
            menunggu — hubungi nomor darurat sekarang atau kirim ulang sinyalnya.
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={1.5} sx={{ maxWidth: 560, mx: 'auto', width: '100%', pt: 3 }}>
        <Button
          ref={callButtonRef}
          component="a"
          href={`tel:${EMERGENCY_NUMBER}`}
          fullWidth
          variant="contained"
          startIcon={<CallRoundedIcon />}
          sx={{
            minHeight: 80,
            borderRadius: 3,
            fontSize: '1.125rem',
            fontWeight: 900,
            bgcolor: sosRed,
            color: '#FFFFFF',
            '&:hover': { bgcolor: sosRed, filter: 'brightness(1.08)' }
          }}>
          
          Hubungi Nomor Darurat Langsung
        </Button>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<ReplayRoundedIcon />}
          onClick={onRetry}
          disabled={retrying}
          sx={{
            minHeight: 72,
            borderRadius: 3,
            fontSize: '1.0625rem',
            fontWeight: 800,
            borderWidth: 3,
            color: '#FFFFFF',
            borderColor: '#FFFFFF',
            '&:hover': { borderWidth: 3, borderColor: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.12)' },
            '&.Mui-disabled': { color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.4)', borderWidth: 3 }
          }}>
          
          {retrying ? 'Mengirim ulang sinyal…' : 'Coba Kirim Ulang'}
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={onDismiss}
          sx={{ minHeight: 56, color: '#CFCFCF', fontWeight: 700, '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
          
          Tutup peringatan
        </Button>
      </Stack>
    </Box>);

}