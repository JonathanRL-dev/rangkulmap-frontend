import React from 'react';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import { Box, Container, IconButton, Paper, Stack, Typography } from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ActiveRequestCardSkeleton } from '../../components/feedback/ActiveRequestCardSkeleton';
import { FullScreenErrorState } from '../../components/feedback/FullScreenErrorState';
import { FullScreenLoadingState } from '../../components/feedback/FullScreenLoadingState';
import { IncomingRequestCard } from '../../components/volunteer/IncomingRequestCard';
import { useErrorHandling } from '../../contexts/ErrorHandlingContext';
import { useVolunteerSession } from '../../contexts/VolunteerSessionContext';
import { useAuth } from '../../hooks/useAuth';
import { useBantuan } from '../../hooks/useBantuan';
import { IncomingHelpRequest } from '../../types/helpRequest';
import { sortActiveRequests } from '../../utils/waitingTime';

export function IncomingRequestsPage() {
  const navigate = useNavigate();
  const { user, isGuest, isLoading: authLoading } = useAuth();
  const { startSession } = useVolunteerSession();
  const { showErrorToast, showServiceError } = useErrorHandling();
  const {
    incomingRequests,
    requestsStatus: status,
    retryRequests: retry,
    isMutating,
    acceptRequest,
    cancelRequest
  } = useBantuan();
  const requests = sortActiveRequests(incomingRequests);

  if (authLoading && !user) {
    return <FullScreenLoadingState label="Memuat sesi relawan" />;
  }

  if (isGuest) {
    return <Navigate to="/masuk" replace />;
  }

  if (user?.role !== 'volunteer') {
    return <Navigate to="/dashboard" replace />;
  }

  const submitRequestAction = async (request: IncomingHelpRequest, action: 'accept' | 'decline') => {
    if (isMutating) return;

    try {
      if (action === 'accept') {
        await acceptRequest(request.id);
        if (!startSession(request)) {
          await cancelRequest(request.id);
          showErrorToast('Sesi bantuan tidak tersimpan', 'Permintaan belum diterima. Periksa penyimpanan perangkat lalu coba lagi.');
          return;
        }
        toast.success('Permintaan diterima', {
          description: `Anda sedang membantu ${request.seekerName}. Jarak ${request.distanceMeters} m.`
        });
        navigate('/dashboard');
      } else {
        await cancelRequest(request.id);
        toast.info('Permintaan dilewati', {
          description: `${request.seekerName} akan dicarikan relawan lain.`
        });
      }
    } catch (reason) {
      showServiceError(
        reason,
        action === 'accept' ? 'Gagal menerima permintaan' : 'Gagal melewati permintaan',
        'Permintaan belum berubah, silakan coba lagi.'
      );
    }
  };

  if (status === 'error') {
    return (
      <FullScreenErrorState
        title="Gagal memuat permintaan bantuan"
        description="Daftar permintaan aktif belum dapat diambil. Periksa koneksi lalu coba lagi."
        onRetry={retry} />);


  }

  return (
    <Box component="main" sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.default' }}>
      <Paper component="header" square elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton aria-label="Kembali ke Dashboard" onClick={() => navigate('/dashboard')}>
              <ArrowBackRoundedIcon />
            </IconButton>
            <Box sx={{ minWidth: 0 }}>
              <Typography component="h1" variant="h2">
                Permintaan Masuk
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Periksa profil pemohon sebelum menerima bantuan.
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Paper>

      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 4 } }}>
        {status === 'loading' ?
        <Stack component="ul" spacing={2} aria-label="Memuat permintaan bantuan" sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {Array.from({ length: 4 }).map((_, index) => <ActiveRequestCardSkeleton key={index} />)}
          </Stack> :
        requests.length > 0 ?
        <Stack component="ul" spacing={2} sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {requests.map((request) =>
          <IncomingRequestCard
            key={request.id}
            request={request}
            onAccept={(item) => void submitRequestAction(item, 'accept')}
            onDecline={(item) => void submitRequestAction(item, 'decline')}
            busy={isMutating} />

          )}
          </Stack> :

        <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: 'center', borderStyle: 'dashed' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', color: 'text.secondary', mb: 1.5 }}>
              <InboxRoundedIcon aria-hidden="true" sx={{ fontSize: 48 }} />
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 800 }}>
              Tidak ada permintaan bantuan masuk saat ini.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Tetap online agar permintaan terdekat langsung muncul di sini.
            </Typography>
          </Paper>
        }
      </Container>
    </Box>);

}