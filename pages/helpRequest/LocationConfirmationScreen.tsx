import React from 'react';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Button, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';

import { FullScreenErrorState } from '../../components/feedback/FullScreenErrorState';
import { MapSkeleton } from '../../components/feedback/MapSkeleton';
import { DraggableLocationMap } from '../../components/helpRequest/DraggableLocationMap';
import { HelpFlowShell } from '../../components/helpRequest/HelpFlowShell';
import { useGeocode } from '../../hooks/useGeocode';
import { MapPinPosition } from '../../types/helpRequest';

interface LocationConfirmationScreenProps {
  notes: string;
  pinPosition: MapPinPosition;
  onNotesChange: (notes: string) => void;
  onPinPositionChange: (position: MapPinPosition) => void;
  onSearch: () => void;
  onBack: () => void;
  onClose: () => void;
}

export function LocationConfirmationScreen({
  notes,
  pinPosition,
  onNotesChange,
  onPinPositionChange,
  onSearch,
  onBack,
  onClose
}: LocationConfirmationScreenProps) {
  const reduceMotion = useReducedMotion();
  const { location, status, retry } = useGeocode(pinPosition, true);

  if (status === 'loading') {
    return (
      <HelpFlowShell
        step={2}
        title="Konfirmasi lokasi Anda"
        subtitle="Mengambil lokasi perangkat sebelum pin dapat disesuaikan."
        onBack={onBack}
        onClose={onClose}>
        
        <Stack spacing={2.5} role="status" aria-label="Mengambil lokasi Anda dari GPS">
          <MapSkeleton variant="location" label="Memuat lokasi GPS" />
          <Skeleton variant="text" width="72%" height={22} />
          <Skeleton variant="rounded" width="100%" height={132} />
          <Skeleton variant="rounded" width="100%" height={64} />
        </Stack>
      </HelpFlowShell>);

  }

  if (status === 'error') {
    return (
      <FullScreenErrorState
        title="Gagal mengakses GPS"
        description="Kami tidak dapat membaca titik lokasi Anda. Pastikan izin lokasi aktif dan Anda berada di area dengan sinyal, lalu coba lagi."
        onRetry={retry}
        secondaryAction={
        <Button fullWidth variant="text" onClick={onClose} sx={{ minHeight: 56 }}>
            Batalkan permintaan bantuan
          </Button>
        } />);


  }

  return (
    <HelpFlowShell
      step={2}
      title="Konfirmasi lokasi Anda"
      subtitle="Geser pin bila perlu agar relawan menuju titik yang tepat."
      onBack={onBack}
      onClose={onClose}>
      
      <Stack
        component={motion.div}
        initial={reduceMotion ? false : { opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
        spacing={2.5}>
        
        <DraggableLocationMap
          position={pinPosition}
          addressLabel={location?.display_name ?? ''}
          onPositionChange={onPinPositionChange} />
        
        <Typography variant="caption" color="text.secondary">
          Pin dapat digeser dengan sentuhan, mouse, atau tombol panah pada keyboard.
        </Typography>
        <TextField
          label="Catatan untuk relawan (opsional)"
          multiline
          minRows={4}
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder="Contoh: Saya menunggu di dekat pintu masuk utama."
          inputProps={{ maxLength: 300 }}
          helperText={`${notes.length}/300 karakter`}
          fullWidth />
        
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<SearchRoundedIcon />}
          onClick={onSearch}
          sx={{ minHeight: 64, borderRadius: 3 }}>
          
          Cari Relawan Terdekat
        </Button>
      </Stack>
    </HelpFlowShell>);

}