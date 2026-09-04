import React, { useEffect } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';

import { InlineResourceError } from '../feedback/InlineResourceError';
import { VolunteerCardSkeleton } from '../feedback/VolunteerCardSkeleton';
import { VolunteerCard } from '../seeker/VolunteerCard';
import { useErrorHandling } from '../../contexts/ErrorHandlingContext';
import { useBantuan } from '../../hooks/useBantuan';

interface NearbyVolunteersSectionProps {
  /** Unique heading id so several instances can coexist in one document. */
  headingId: string;
  title: string;
  description: string;
  onSeeAll: () => void;
  /** Optional action rendered directly below the volunteer list. */
  footerAction?: React.ReactNode;
}

export function NearbyVolunteersSection({
  headingId,
  title,
  description,
  onSeeAll,
  footerAction
}: NearbyVolunteersSectionProps) {
  const { showErrorToast } = useErrorHandling();
  const { nearbyVolunteers, volunteersStatus, retryVolunteers } = useBantuan();

  useEffect(() => {
    if (volunteersStatus === 'error') {
      showErrorToast('Gagal memuat daftar relawan', 'Daftar di Dashboard belum diperbarui. Coba lagi.');
    }
  }, [showErrorToast, volunteersStatus]);

  return (
    <Box component="section" aria-labelledby={headingId}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" spacing={2} sx={{ mb: 1.5 }}>
        <Box>
          <Typography id={headingId} component="h2" variant="h3">
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
        </Box>
        <Button variant="text" onClick={onSeeAll} sx={{ flexShrink: 0 }}>
          Lihat semua
        </Button>
      </Stack>

      {volunteersStatus === 'error' ?
      <InlineResourceError
        title="Daftar relawan belum tersedia"
        description="Koneksi ke data relawan terputus."
        onRetry={retryVolunteers} /> :


      <Box
        role="list"
        aria-label={title}
        tabIndex={0}
        sx={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: { xs: 'minmax(270px, 84vw)', sm: '310px' },
          gap: 2,
          overflowX: 'auto',
          pb: 1.5,
          mx: { xs: -2, md: 0 },
          px: { xs: 2, md: 0 },
          scrollSnapType: 'x mandatory',
          touchAction: 'pan-x',
          '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: 3 }
        }}>
        
          {volunteersStatus === 'loading' ?
        Array.from({ length: 3 }).map((_, index) => <VolunteerCardSkeleton key={index} snap />) :
        nearbyVolunteers.map((volunteer) => <VolunteerCard key={volunteer.id} volunteer={volunteer} snap />)}
        </Box>
      }

      {footerAction && <Box sx={{ mt: 1 }}>{footerAction}</Box>}
    </Box>);

}