import React, { useState } from 'react';
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { FullScreenErrorState } from '../../components/feedback/FullScreenErrorState';
import { ProfessionalCardSkeleton } from '../../components/feedback/ProfessionalCardSkeleton';
import { ProfessionalCard } from '../../components/professional/ProfessionalCard';
import { ProfessionalFilterBar } from '../../components/professional/ProfessionalFilterBar';
import { ProfessionalHeader } from '../../components/professional/ProfessionalHeader';
import { useBooking } from '../../hooks/useBooking';
import { ProfessionalServiceType } from '../../types/professional';

export function ProfessionalServicesPage() {
  const navigate = useNavigate();
  const [serviceType, setServiceType] = useState<ProfessionalServiceType | 'all'>('all');
  const [location, setLocation] = useState('all');
  const [availableDate, setAvailableDate] = useState('');
  const {
    professionals: visibleProfessionals,
    serviceTypeOptions,
    serviceLocations,
    status,
    retry
  } = useBooking({ filters: { serviceType, location, availableDate } });

  if (status === 'error') {
    return (
      <FullScreenErrorState
        title="Gagal memuat layanan profesional"
        description="Daftar mitra belum dapat diambil. Periksa koneksi lalu coba lagi."
        onRetry={retry}
        secondaryAction={
        <Button fullWidth color="inherit" onClick={() => navigate('/dashboard')}>
            Kembali ke Dashboard
          </Button>
        } />);


  }

  return (
    <Box component="main" sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.default' }}>
      <ProfessionalHeader
        title="Layanan Profesional"
        subtitle="Pendamping terverifikasi untuk kebutuhan yang lebih kompleks"
        onBack={() => navigate('/dashboard')} />
      

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 4 } }}>
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, mb: 3 }}>
          <Typography component="h2" variant="h3" sx={{ mb: 1.5 }}>
            Temukan pendamping yang tepat
          </Typography>
          <ProfessionalFilterBar
            serviceTypeOptions={serviceTypeOptions}
            serviceLocations={serviceLocations}
            serviceType={serviceType}
            location={location}
            availableDate={availableDate}
            onServiceTypeChange={setServiceType}
            onLocationChange={setLocation}
            onAvailableDateChange={setAvailableDate} />
          
        </Paper>

        <Stack direction="row" alignItems="baseline" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Typography component="h2" variant="h3">
            Mitra tersedia
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {visibleProfessionals.length} profesional ditemukan
          </Typography>
        </Stack>

        {status === 'loading' ?
        <Box aria-label="Memuat daftar mitra profesional" sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: { xs: 1.5, sm: 2.5 } }}>
            {Array.from({ length: 4 }).map((_, index) => <ProfessionalCardSkeleton key={index} />)}
          </Box> :
        visibleProfessionals.length > 0 ?
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: { xs: 1.5, sm: 2.5 } }}>
            {visibleProfessionals.map((professional) =>
          <ProfessionalCard
            key={professional.id}
            professional={professional}
            onSelect={(id) => navigate(`/layanan-profesional/${id}`)} />

          )}
          </Box> :

        <Paper variant="outlined" sx={{ textAlign: 'center', p: 5, borderRadius: 3 }}>
            <MedicalServicesRoundedIcon color="primary" sx={{ fontSize: 48 }} />
            <Typography component="h2" variant="h3" sx={{ mt: 1.5 }}>
              Belum ada mitra yang cocok
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Coba ubah jenis layanan atau lokasi pencarian.
            </Typography>
          </Paper>
        }
      </Container>
    </Box>);

}