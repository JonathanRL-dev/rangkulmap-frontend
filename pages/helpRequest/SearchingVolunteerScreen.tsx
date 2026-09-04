import React, { useEffect } from 'react';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { Button } from '@mui/material';

import { FullScreenErrorState } from '../../components/feedback/FullScreenErrorState';
import { HelpFlowShell } from '../../components/helpRequest/HelpFlowShell';
import { RippleSearch } from '../../components/helpRequest/RippleSearch';

interface SearchingVolunteerScreenProps {
  status: 'loading' | 'error' | 'ready';
  onRetry: () => void;
  onMatchFound: () => void;
  onCancel: () => void;
  onBack: () => void;
}

export function SearchingVolunteerScreen({
  status,
  onRetry,
  onMatchFound,
  onCancel,
  onBack
}: SearchingVolunteerScreenProps) {

  useEffect(() => {
    if (status !== 'ready') return;
    const timer = window.setTimeout(onMatchFound, 2400);
    return () => window.clearTimeout(timer);
  }, [onMatchFound, status]);

  if (status === 'error') {
    return (
      <FullScreenErrorState
        title="Gagal mencari relawan"
        description="Koneksi terputus saat mengirim permintaan bantuan. Periksa koneksi lalu coba lagi."
        onRetry={onRetry}
        secondaryAction={
        <Button fullWidth variant="text" color="inherit" onClick={onCancel} sx={{ minHeight: 48 }}>
            Batalkan Permintaan
          </Button>
        } />);


  }

  return (
    <HelpFlowShell
      step={3}
      title="Menghubungkan dengan relawan"
      subtitle={status === 'loading' ? 'Mengirim permintaan bantuan…' : 'Pencarian berjalan berdasarkan lokasi dan jenis bantuan Anda.'}
      onBack={onBack}
      onClose={onCancel}>
      
      <RippleSearch />
      <Button
        fullWidth
        variant="outlined"
        size="large"
        startIcon={<CancelRoundedIcon />}
        onClick={onCancel}
        sx={{ minHeight: 56, borderRadius: 3 }}>
        
        Batalkan
      </Button>
    </HelpFlowShell>);

}