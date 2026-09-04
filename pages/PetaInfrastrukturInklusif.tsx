import React, { useState } from 'react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import { Box, Button, Chip, Fab, Paper, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { FullScreenErrorState } from '../components/feedback/FullScreenErrorState';
import { MapSkeleton } from '../components/feedback/MapSkeleton';
import { CategoryIcon } from '../components/infrastructure/CategoryIcon';
import { InfrastructureDetailSheet } from '../components/infrastructure/InfrastructureDetailSheet';
import { InfrastructureMapCanvas } from '../components/infrastructure/InfrastructureMapCanvas';
import { InfrastructureReportDialog } from '../components/infrastructure/InfrastructureReportDialog';
import { useErrorHandling } from '../contexts/ErrorHandlingContext';
import { useGeocode } from '../hooks/useGeocode';
import { useInfrastruktur } from '../hooks/useInfrastruktur';
import { InfrastructurePoint, InfrastructureReportFormValues } from '../types/infrastructure';

export function PetaInfrastrukturInklusif() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedPoint, setSelectedPoint] = useState<InfrastructurePoint | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const { showServiceError } = useErrorHandling();
  const { location } = useGeocode();
  const {
    points,
    visiblePoints,
    categories,
    activeCategories,
    status: mapStatus,
    confirmingPointId,
    retry: retryMap,
    toggleCategory,
    confirmPoint,
    reportNewPoint,
    reportPointChanged
  } = useInfrastruktur(location ?
  { latitude: location.latitude, longitude: location.longitude } :
  undefined);

  const handleConfirmAccurate = async (point: InfrastructurePoint) => {
    try {
      await confirmPoint(point.id);
      setSelectedPoint(null);
      toast.success('Konfirmasi tercatat', {
        description: `${point.name} ditandai masih akurat. Terima kasih sudah membantu komunitas.`
      });
    } catch (reason) {
      showServiceError(reason, 'Konfirmasi gagal dikirim', 'Status titik belum berubah, silakan coba lagi.');
    }
  };

  const handleReportChanged = async (point: InfrastructurePoint) => {
    try {
      await reportPointChanged(point.id);
      setSelectedPoint(null);
      setReportDialogOpen(true);
      toast.info(`Memperbarui laporan untuk ${point.name}`);
    } catch (reason) {
      showServiceError(reason, 'Laporan perubahan gagal dikirim', 'Status titik belum berubah, silakan coba lagi.');
    }
  };

  const handleNewReportSubmit = async (values: InfrastructureReportFormValues) => {
    try {
      await reportNewPoint(values);
      setReportDialogOpen(false);
      toast.success('Laporan berhasil dikirim', {
        description: `${values.photo.name} diterima dan akan diperiksa sebelum ditampilkan sebagai terverifikasi.`
      });
      return true;
    } catch (reason) {
      showServiceError(reason, 'Laporan gagal dikirim', 'Foto belum selesai diunggah. Coba kirim ulang.');
      return false;
    }
  };

  if (mapStatus === 'loading') {
    return <MapSkeleton label="Memuat peta infrastruktur inklusif" />;
  }

  if (mapStatus === 'error') {
    return (
      <FullScreenErrorState
        title="Gagal memuat peta"
        description="Peta infrastruktur tidak dapat dimuat karena koneksi terputus. Periksa jaringan Anda lalu coba lagi."
        onRetry={retryMap}
        secondaryAction={
        <Button fullWidth variant="text" onClick={() => navigate('/dashboard')} sx={{ minHeight: 56 }}>
            Kembali ke Beranda
          </Button>
        } />);


  }

  return (
    <Box component="main" sx={{ position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden', bgcolor: 'background.default' }}>
      <InfrastructureMapCanvas
        points={visiblePoints}
        totalCount={points.length}
        areaLabel={location?.address.suburb ?? ''}
        cityLabel={location?.address.city ?? ''}
        onSelectPoint={setSelectedPoint} />
      

      <Paper
        component="header"
        elevation={4}
        sx={{
          position: 'absolute',
          zIndex: 5,
          top: { xs: 12, sm: 20 },
          left: { xs: 12, sm: 20 },
          right: { xs: 12, sm: 20 },
          maxWidth: 1180,
          mx: 'auto',
          p: { xs: 1.25, sm: 1.75 },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3
        }}>
        
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ flexShrink: 0, display: { xs: 'none', sm: 'inline-flex' } }}>
            
            Beranda
          </Button>
          <Button
            variant="outlined"
            aria-label="Kembali ke Beranda"
            onClick={() => navigate('/dashboard')}
            sx={{ display: { xs: 'inline-flex', sm: 'none' }, px: 1.25 }}>
            
            <ArrowBackRoundedIcon sx={{ mr: 0.75 }} />
            Beranda
          </Button>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">
              Peta komunitas
            </Typography>
            <Typography component="h1" variant="h3" noWrap>
              Infrastruktur Inklusif
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Box
        component="section"
        aria-label="Filter kategori infrastruktur"
        sx={{
          position: 'absolute',
          zIndex: 4,
          top: { xs: 100, sm: 112 },
          left: 0,
          right: 0,
          px: { xs: 1.5, sm: 2.5 }
        }}>
        
        <Stack
          direction="row"
          spacing={1}
          sx={{
            maxWidth: 1180,
            mx: 'auto',
            overflowX: 'auto',
            pb: 1,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' }
          }}>
          
          {categories.map((category) => {
            const active = activeCategories.has(category.id);
            return (
              <Chip
                key={category.id}
                clickable
                icon={<CategoryIcon category={category.id} fontSize="small" />}
                label={category.label}
                onClick={() => toggleCategory(category.id)}
                aria-pressed={active}
                aria-label={`${category.label}, filter ${active ? 'aktif' : 'nonaktif'}`}
                variant={active ? 'filled' : 'outlined'}
                sx={{
                  flexShrink: 0,
                  minHeight: 48,
                  px: 0.75,
                  bgcolor: active ? 'primary.main' : alpha(theme.palette.background.paper, 0.96),
                  color: active ? 'primary.contrastText' : 'text.primary',
                  borderWidth: active ? 0 : 2,
                  borderColor: 'divider',
                  boxShadow: '0 3px 10px rgba(0,0,0,.14)',
                  fontWeight: 700,
                  '& .MuiChip-icon': { color: 'inherit' },
                  '&:hover': { bgcolor: active ? 'primary.dark' : 'background.paper' }
                }} />);


          })}
        </Stack>
      </Box>

      <Paper
        elevation={2}
        sx={{
          position: 'absolute',
          zIndex: 3,
          top: { xs: 160, sm: 176 },
          left: { xs: 12, sm: 20 },
          px: 1.25,
          py: 0.75,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 0.75
        }}>
        
        <LayersRoundedIcon color="primary" fontSize="small" />
        <Typography variant="caption" sx={{ fontWeight: 800 }}>
          {visiblePoints.length} dari {points.length} titik tampil
        </Typography>
      </Paper>

      <Fab
        variant="extended"
        color="primary"
        aria-label="Laporkan Titik Baru"
        onClick={() => setReportDialogOpen(true)}
        sx={{
          position: 'absolute',
          zIndex: 5,
          right: { xs: 16, sm: 24 },
          bottom: { xs: 20, sm: 24 },
          minHeight: 56,
          px: 2.25,
          fontWeight: 800,
          '& .MuiFab-extendedIcon': { mr: 1 }
        }}>
        
        <AddRoundedIcon sx={{ mr: 1 }} />
        Laporkan Titik Baru
      </Fab>

      <InfrastructureDetailSheet
        point={selectedPoint}
        onClose={() => setSelectedPoint(null)}
        onConfirmAccurate={(point) => void handleConfirmAccurate(point)}
        onReportChanged={(point) => void handleReportChanged(point)}
        confirming={Boolean(confirmingPointId)} />
      
      <InfrastructureReportDialog
        open={reportDialogOpen}
        categories={categories}
        onClose={() => setReportDialogOpen(false)}
        onSubmit={handleNewReportSubmit} />
      
    </Box>);

}