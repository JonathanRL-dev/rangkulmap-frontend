import React, { useEffect } from 'react';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';

import { ActiveRequestCard } from './ActiveRequestCard';
import { ActiveSessionBanner } from './ActiveSessionBanner';
import { ActiveRequestCardSkeleton } from '../feedback/ActiveRequestCardSkeleton';
import { InlineResourceError } from '../feedback/InlineResourceError';
import { RequestBackupButton } from './RequestBackupButton';
import { DraggableSheet } from '../dashboard/DraggableSheet';
import { NearbyVolunteersSection } from '../dashboard/NearbyVolunteersSection';
import { useErrorHandling } from '../../contexts/ErrorHandlingContext';
import { useVolunteerSession } from '../../contexts/VolunteerSessionContext';
import { useBantuan } from '../../hooks/useBantuan';
import { IncomingHelpRequest } from '../../types/helpRequest';
import { sortActiveRequests } from '../../utils/waitingTime';

interface VolunteerAssistanceSheetProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onOpenRequest: (request: IncomingHelpRequest) => void;
  onSeeAllRequests: () => void;
  onSeeAllVolunteers: () => void;
  onRequestBackup: () => void;
}

export function VolunteerAssistanceSheet({
  expanded,
  onExpandedChange,
  onOpenRequest,
  onSeeAllRequests,
  onSeeAllVolunteers,
  onRequestBackup
}: VolunteerAssistanceSheetProps) {
  const { activeSession, isHelping, endSession } = useVolunteerSession();
  const { showErrorToast, showServiceError } = useErrorHandling();
  const {
    incomingRequests,
    requestsStatus,
    retryRequests,
    isMutating,
    completeRequest
  } = useBantuan();
  const activeRequests = sortActiveRequests(incomingRequests);

  useEffect(() => {
    if (requestsStatus === 'error') {
      showErrorToast('Gagal memuat permintaan aktif', 'Panel belum dapat diperbarui. Coba lagi.');
    }
  }, [requestsStatus, showErrorToast]);

  const handleEndSession = () => {
    if (!activeSession || isMutating) return;
    void (async () => {
      try {
        await completeRequest(activeSession.requestId);
        if (!endSession()) {
          showErrorToast('Sesi belum dapat diselesaikan', 'Penyimpanan perangkat tidak tersedia. Coba lagi.');
        }
      } catch (reason) {
        showServiceError(reason, 'Sesi belum dapat diselesaikan', 'Status bantuan belum berubah, silakan coba lagi.');
      }
    })();
  };

  return (
    <DraggableSheet
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      collapsedTitle={`${activeRequests.length} Permintaan Bantuan Aktif`}
      expandedTitle="Permintaan Bantuan Aktif"
      collapsedLabel="Bilah relawan terlipat. Ketuk dua kali untuk membuka permintaan bantuan aktif"
      expandedLabel="Bilah relawan terbuka. Ketuk dua kali untuk melipat panel"
      collapsedAction={
      <Button
        variant="contained"
        size="small"
        onClick={onSeeAllRequests}
        sx={{ minHeight: 48, px: { xs: 1.25, sm: 2 }, whiteSpace: 'nowrap' }}>
        
          Lihat Semua
        </Button>
      }>
      
      <Stack spacing={3.5}>
        {activeSession && <ActiveSessionBanner session={activeSession} onEndSession={handleEndSession} />}

        <Box component="section" aria-labelledby="active-requests-title">
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end" spacing={2} sx={{ mb: 1.5 }}>
            <Box>
              <Typography id="active-requests-title" component="h2" variant="h3">
                Permintaan Bantuan Aktif
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Diurutkan dari prioritas dan yang paling lama menunggu.
              </Typography>
            </Box>
            <Button variant="text" onClick={onSeeAllRequests} sx={{ flexShrink: 0 }}>
              Lihat semua
            </Button>
          </Stack>

          {requestsStatus === 'loading' ?
          <Stack component="ul" spacing={1.5} aria-label="Memuat permintaan bantuan aktif" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {Array.from({ length: 3 }).map((_, index) => <ActiveRequestCardSkeleton key={index} />)}
            </Stack> :
          requestsStatus === 'error' ?
          <InlineResourceError
            title="Permintaan aktif belum tersedia"
            description="Data permintaan bantuan tidak dapat diperbarui."
            onRetry={retryRequests} /> :

          activeRequests.length > 0 ?
          <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {activeRequests.map((request) =>
            <ActiveRequestCard key={request.id} request={request} onOpen={onOpenRequest} />
            )}
            </Stack> :

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, textAlign: 'center', borderStyle: 'dashed' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', color: 'text.secondary', mb: 1 }}>
                <InboxRoundedIcon aria-hidden="true" sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 800 }}>
                Belum ada permintaan bantuan aktif.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Tetap online agar permintaan terdekat langsung muncul di sini.
              </Typography>
            </Paper>
          }
        </Box>

        <NearbyVolunteersSection
          headingId="volunteer-nearby-volunteers-title"
          title="Relawan Lain di Sekitar"
          description="3 relawan lain sedang aktif dalam radius 500 m"
          onSeeAll={onSeeAllVolunteers}
          footerAction={<RequestBackupButton isHelping={isHelping} onRequestBackup={onRequestBackup} />} />
        
      </Stack>
    </DraggableSheet>);

}