import React from 'react';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { Box, Button, Chip, Container, Divider, Paper, Rating, Stack, Typography } from '@mui/material';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { FullScreenErrorState } from '../../components/feedback/FullScreenErrorState';
import { ProfessionalDetailSkeleton } from '../../components/feedback/ProfessionalDetailSkeleton';
import { ProfessionalHeader } from '../../components/professional/ProfessionalHeader';
import { useBooking } from '../../hooks/useBooking';
import { formatIDR } from '../../utils/currency';

export function ProfessionalDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{id: string;}>();
  const { professional, status, retry } = useBooking({ professionalId: id });

  if (!professional) return <Navigate to="/layanan-profesional" replace />;

  if (status === 'error') {
    return (
      <FullScreenErrorState
        title="Gagal memuat profil mitra"
        description="Detail mitra profesional belum dapat diambil. Periksa koneksi lalu coba lagi."
        onRetry={retry} />);


  }

  return (
    <Box component="main" sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.default', pb: 13 }}>
      <ProfessionalHeader title="Profil Mitra" subtitle={professional.credential} onBack={() => navigate('/layanan-profesional')} />

      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 4 } }}>
        {status === 'loading' ?
        <ProfessionalDetailSkeleton /> :

        <>
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', mb: 2.5 }}>
          <Box
              component="img"
              src={professional.imageUrl}
              alt={`Foto ${professional.name}`}
              sx={{ width: '100%', height: { xs: 270, sm: 390 }, objectFit: 'cover', objectPosition: 'center 20%' }} />
            
          <Stack spacing={1.25} sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} gap={1.5}>
              <Box>
                <Typography component="h1" variant="h1">
                  {professional.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                  {professional.specialization} · {professional.location}
                </Typography>
              </Box>
              <Chip
                  icon={<ShieldRoundedIcon />}
                  label="Terverifikasi"
                  variant="outlined"
                  sx={{
                    alignSelf: 'flex-start',
                    minHeight: 42,
                    color: 'text.primary',
                    borderWidth: 2,
                    borderColor: 'success.main',
                    fontWeight: 800,
                    '& .MuiChip-icon': { color: 'success.main' }
                  }} />
                
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Rating value={professional.rating} precision={0.1} readOnly aria-label={`Rating ${professional.rating} dari 5`} sx={{ color: 'primary.main' }} />
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {professional.rating.toFixed(1)} · {professional.reviewCount} ulasan
              </Typography>
            </Stack>
            <Typography variant="h3" sx={{ pt: 0.5 }}>
              {formatIDR(professional.hourlyRate)} / jam
            </Typography>
          </Stack>
        </Paper>

        <Stack spacing={2.5}>
          <Paper component="section" variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
            <Typography component="h2" variant="h3" sx={{ mb: 1 }}>
              Tentang {professional.name.split(',')[0]}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {professional.bio}
            </Typography>
          </Paper>

          <Paper component="section" variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
            <Typography component="h2" variant="h3" sx={{ mb: 2 }}>
              Kualifikasi & Sertifikasi
            </Typography>
            <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {professional.qualifications.map((qualification) =>
                <Stack component="li" key={qualification} direction="row" spacing={1.25} alignItems="flex-start">
                  <CheckCircleRoundedIcon sx={{ color: 'success.main', mt: 0.15 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {qualification}
                  </Typography>
                </Stack>
                )}
            </Stack>
          </Paper>

          <Paper component="section" variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
            <Typography component="h2" variant="h3" sx={{ mb: 2 }}>
              Ulasan Klien
            </Typography>
            <Stack spacing={2} divider={<Divider flexItem />}>
              {professional.reviews.map((review) =>
                <Box component="article" key={review.author}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Typography component="h3" variant="body1" sx={{ fontWeight: 800 }}>
                      {review.author}
                    </Typography>
                    <Rating value={review.rating} precision={0.1} readOnly size="small" sx={{ color: 'primary.main' }} />
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <FormatQuoteRoundedIcon color="primary" fontSize="small" />
                    <Typography variant="body1" color="text.secondary">
                      {review.text}
                    </Typography>
                  </Stack>
                </Box>
                )}
            </Stack>
          </Paper>
        </Stack>
        </>
        }
      </Container>

      <Paper
        elevation={6}
        sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 10, borderTop: '1px solid', borderColor: 'divider' }}>
        
        <Container maxWidth="md" sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<EventAvailableRoundedIcon />}
            onClick={() => navigate(`/layanan-profesional/${professional.id}/pesan`)}
            disabled={status === 'loading'}
            sx={{ minHeight: 64, borderRadius: 3 }}>
            
            {status === 'loading' ? 'Memuat profil…' : 'Pesan Sekarang'}
          </Button>
        </Container>
      </Paper>
    </Box>);

}