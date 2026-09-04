import React, { useMemo, useState } from 'react';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { Box, Button, Container, IconButton, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { FullScreenErrorState } from '../components/feedback/FullScreenErrorState';
import { VolunteerCardSkeleton } from '../components/feedback/VolunteerCardSkeleton';
import { VolunteerCard } from '../components/seeker/VolunteerCard';
import { VolunteerListControls } from '../components/seeker/VolunteerListControls';
import { VolunteerSummaryChips } from '../components/seeker/VolunteerSummaryChips';
import { useAuth } from '../hooks/useAuth';
import { useBantuan } from '../hooks/useBantuan';
import {
  countActive,
  countReady,
  filterVolunteers,
  sortVolunteers,
  VolunteerFilter,
  VolunteerSort } from
'../utils/volunteerStats';

/** Guests may preview only the two closest volunteers. */
const GUEST_PREVIEW_LIMIT = 2;

export function AllNearbyVolunteersPage() {
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const { volunteers, volunteersStatus: status, retryVolunteers: retry } = useBantuan();
  const [filter, setFilter] = useState<VolunteerFilter>('all');
  const [sort, setSort] = useState<VolunteerSort>('distance');

  const visibleVolunteers = useMemo(
    () => sortVolunteers(filterVolunteers(volunteers, filter), sort),
    [filter, sort, volunteers]
  );

  const counts: Record<VolunteerFilter, number> = {
    all: volunteers.length,
    ready: countReady(volunteers),
    active: countActive(volunteers)
  };

  if (status === 'error') {
    return (
      <FullScreenErrorState
        title="Gagal memuat daftar relawan"
        description="Daftar relawan terdekat belum bisa diambil karena koneksi terputus. Periksa jaringan Anda lalu coba lagi."
        onRetry={retry}
        secondaryAction={
        <Button fullWidth variant="text" onClick={() => navigate('/dashboard')} sx={{ minHeight: 56 }}>
            Kembali ke Beranda
          </Button>
        } />);


  }

  return (
    <Box component="main" sx={{ minHeight: '100vh', width: '100%', bgcolor: 'background.default', pb: 6 }}>
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
        
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 1.5 }}>
            <IconButton
              onClick={() => navigate('/dashboard')}
              aria-label="Kembali ke Dashboard"
              sx={{
                width: 48,
                height: 48,
                flexShrink: 0,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                color: 'text.primary'
              }}>
              
              <ArrowBackRoundedIcon />
            </IconButton>
            <Box sx={{ minWidth: 0 }}>
              <Typography component="h1" variant="h3" noWrap>
                Semua Relawan Terdekat
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary' }}>
                <RefreshRoundedIcon aria-hidden="true" sx={{ fontSize: 15 }} />
                <Typography variant="caption">Diperbarui baru saja</Typography>
              </Stack>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 }, pt: 2.5 }}>
        <Stack spacing={2.5}>
          <Paper variant="outlined" sx={{ p: { xs: 1.75, sm: 2 }, borderRadius: 3 }}>
            <Stack spacing={1.75}>
              <VolunteerSummaryChips volunteers={volunteers} />
              <Typography variant="body2" color="text.secondary">
                {volunteers.length} relawan aktif di sekitar Gondokusuman
              </Typography>
            </Stack>
          </Paper>

          <VolunteerListControls
            filter={filter}
            onFilterChange={setFilter}
            sort={sort}
            onSortChange={setSort}
            counts={counts} />
          

          {status === 'loading' ?
          <Box
            role="list"
            aria-label="Memuat daftar relawan terdekat"
            sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
            
              {Array.from({ length: 6 }).map((_, index) => <VolunteerCardSkeleton key={index} />)}
            </Box> :
          visibleVolunteers.length > 0 ?
          <Box
            role="list"
            aria-label="Daftar semua relawan aktif terdekat"
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: 2,
              alignItems: 'stretch'
            }}>
            
              {visibleVolunteers.map((volunteer, index) => {
              const restricted = isGuest && index >= GUEST_PREVIEW_LIMIT;
              return (
                <VolunteerCard
                  key={volunteer.id}
                  volunteer={volunteer}
                  restricted={restricted}
                  onRestrictedClick={restricted ? () => navigate('/masuk') : undefined} />);


            })}
            </Box> :

          <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: 'center', borderStyle: 'dashed' }}>
              <Typography variant="body1" sx={{ fontWeight: 800 }}>
                Tidak ada relawan pada filter ini.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Pilih filter “Semua” untuk melihat seluruh relawan di sekitar Anda.
              </Typography>
            </Paper>
          }
        </Stack>
      </Container>
    </Box>);

}