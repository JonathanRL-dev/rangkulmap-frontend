import React, { useState } from 'react';
import AccessibilityNewRoundedIcon from '@mui/icons-material/AccessibilityNewRounded';
import EmergencyRoundedIcon from '@mui/icons-material/EmergencyRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Container,
  Fab,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Tooltip,
  Typography } from
'@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import { FullScreenErrorState } from '../components/feedback/FullScreenErrorState';
import { MapSkeleton } from '../components/feedback/MapSkeleton';
import { MailboxButton } from '../components/mailbox/MailboxButton';
import { MailboxDrawer } from '../components/mailbox/MailboxDrawer';
import { ProfileLevelBadge } from '../components/profile/ProfileLevelBadge';
import { SeekerAssistanceSheet } from '../components/seeker/SeekerAssistanceSheet';
import { SosSignalFailureScreen } from '../components/sos/SosSignalFailureScreen';
import { VolunteerAssistanceSheet } from '../components/volunteer/VolunteerAssistanceSheet';
import { useMailbox } from '../contexts/MailboxContext';
import { useAuth } from '../hooks/useAuth';
import { useBantuan } from '../hooks/useBantuan';
import { useGamifikasi } from '../hooks/useGamifikasi';
import { useGeocode } from '../hooks/useGeocode';
import { useResourceStatus } from '../hooks/useResourceStatus';
import { useSos } from '../hooks/useSos';

export function SeekerHomeDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const { unclaimedCount } = useMailbox();
  const { status: mapStatus, retry: retryMap } = useResourceStatus();
  const { location } = useGeocode();
  const { incomingRequests } = useBantuan();
  const { progression } = useGamifikasi(user?.account_id);
  const {
    isSending: sosSending,
    isSosDisabled,
    failureOpen: sosFailureOpen,
    noticeOpen: sosNoticeOpen,
    sendSos,
    dismissFailure: dismissSosFailure,
    dismissNotice: dismissSosNotice
  } = useSos(location ?
  { latitude: location.latitude, longitude: location.longitude, address: location.display_name } :
  undefined);
  const isVolunteer = user?.role === 'volunteer';
  const isAuthenticated = !isGuest;
  const isDark = theme.palette.mode === 'dark';
  const [mailboxOpen, setMailboxOpen] = useState(false);
  const [sosDisabledNoticeOpen, setSosDisabledNoticeOpen] = useState(false);
  const [assistancePanelExpanded, setAssistancePanelExpanded] = useState(true);
  const displayName = user?.display_name ?? 'Guest';
  const roleLabel = user?.role === 'volunteer' ?
  'Relawan' :
  user?.role === 'seeker' ?
  'Pencari Bantuan' :
  user?.role === 'professional' ?
  'Mitra Profesional' :
  'Mode Guest';
  const initials = displayName.
  split(' ').
  slice(0, 2).
  map((part) => part[0]).
  join('').
  toUpperCase();

  const handleRequestHelp = () => {
    navigate('/minta-bantuan');
  };

  // A failed SOS never degrades to a normal toast; it takes over the screen.
  const sendSosSignal = () => {
    if (isSosDisabled) {
      setSosDisabledNoticeOpen(true);
      return;
    }
    void sendSos();
  };

  if (mapStatus === 'error') {
    return (
      <FullScreenErrorState
        title="Gagal memuat peta"
        description="Peta utama belum dapat dimuat. Periksa koneksi lalu coba lagi."
        onRetry={retryMap} />);


  }

  return (
    <Box component="main" sx={{ height: '100dvh', width: '100%', bgcolor: 'background.default', overflow: 'hidden' }}>
      <Box
        component="section"
        aria-label={`Peta lokasi Anda di ${location?.display_name ?? ''}`}
        sx={{
          position: 'relative',
          height: '100dvh',
          minHeight: 520,
          overflow: 'hidden',
          bgcolor: alpha(theme.palette.success.main, isDark ? 0.16 : 0.12),
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
        
        {mapStatus === 'loading' ? <MapSkeleton variant="dashboard" label="Memuat peta Dashboard" /> : <MapPlaceholder />}

        <Container maxWidth="lg" sx={{ position: 'relative', height: '100%', px: { xs: 2, md: 3 } }}>
          <Paper
            component="header"
            elevation={0}
            sx={{
              position: 'absolute',
              zIndex: 4,
              top: { xs: 16, md: 24 },
              left: { xs: 16, md: 24 },
              right: { xs: 16, md: 24 },
              p: { xs: 1.25, md: 1.5 },
              pl: { xs: 1.75, md: 2 },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              boxShadow: theme.shadows[4]
            }}>
            
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  {roleLabel}
                </Typography>
                <Typography component="h1" variant="h3" noWrap>
                  {displayName}
                </Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Chip
                  icon={<LocationOnRoundedIcon />}
                  label={location?.address.city ?? ''}
                  size="small"
                  sx={{
                    display: { xs: 'none', md: 'inline-flex' },
                    minHeight: 36,
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.primary.main, isDark ? 0.22 : 0.1),
                    color: 'text.primary'
                  }} />
                
                <Button
                  variant="outlined"
                  startIcon={<SettingsRoundedIcon />}
                  onClick={() => navigate('/pengaturan')}
                  sx={{ display: { xs: 'none', sm: 'inline-flex' }, flexShrink: 0 }}>
                  
                  Pengaturan
                </Button>
                {isAuthenticated ?
                <>
                    {user?.role === 'volunteer' &&
                  <Tooltip title="Permintaan bantuan masuk" arrow>
                        <IconButton
                      aria-label={`Buka permintaan bantuan masuk. ${incomingRequests.length} permintaan menunggu`}
                      onClick={() => navigate('/permintaan-masuk')}
                      sx={{
                        width: 48,
                        height: 48,
                        flexShrink: 0,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper'
                      }}>
                      
                          <Badge
                        badgeContent={incomingRequests.length}
                        color="warning"
                        overlap="circular"
                        sx={{ '& .MuiBadge-badge': { border: '2px solid', borderColor: 'background.paper' } }}>
                        
                            <NotificationsActiveRoundedIcon aria-hidden="true" />
                          </Badge>
                        </IconButton>
                      </Tooltip>
                  }
                    <Tooltip title="Buka Profil Akun" arrow>
                      <IconButton
                      aria-label={`Buka Profil Akun ${displayName}`}
                      onClick={() => navigate('/profil')}
                      sx={{
                        width: 48,
                        height: 48,
                        flexShrink: 0,
                        p: 0,
                        border: '2px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        '&:hover': { borderColor: 'primary.main' }
                      }}>
                      
                        <Avatar
                        src={user?.avatar_url}
                        alt={`Foto profil ${displayName}`}
                        sx={{ width: 42, height: 42, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                        
                          {initials}
                        </Avatar>
                      </IconButton>
                    </Tooltip>
                    <MailboxButton unclaimedCount={unclaimedCount} onOpen={() => setMailboxOpen(true)} />
                    <ProfileLevelBadge
                    level={progression.currentLevel}
                    onOpenProgression={() => navigate('/progression-level')} />
                  
                  </> :

                <>
                    <Badge
                    badgeContent="Guest"
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    aria-label="Profil Guest"
                    sx={{
                      flexShrink: 0,
                      '& .MuiBadge-badge': {
                        right: 12,
                        bottom: 2,
                        height: 18,
                        minWidth: 36,
                        px: 0.75,
                        borderRadius: 9,
                        border: '2px solid',
                        borderColor: 'background.paper',
                        bgcolor: 'grey.600',
                        color: 'common.white',
                        fontSize: '0.625rem'
                      }
                    }}>
                    
                      <Avatar sx={{ width: 48, height: 48, bgcolor: 'grey.200', color: 'grey.600' }}>
                        <PersonOutlineRoundedIcon aria-hidden="true" />
                      </Avatar>
                    </Badge>
                    <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/masuk')}
                    sx={{ minWidth: 48, minHeight: 48, flexShrink: 0, px: { xs: 1.25, sm: 2 }, whiteSpace: 'nowrap' }}>
                    
                      Log In / Daftar
                    </Button>
                  </>
                }
              </Stack>
            </Stack>
          </Paper>

          <Box
            sx={{
              position: 'absolute',
              zIndex: 3,
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              pt: 8,
              pointerEvents: 'none'
            }}>
            
            <Stack alignItems="center" spacing={1}>
              <Box
                sx={{
                  position: 'relative',
                  width: 100,
                  height: 100,
                  display: 'grid',
                  placeItems: 'center',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.16),
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`
                  }
                }}>
                
                <Avatar
                  src={user?.avatar_url}
                  aria-label="Lokasi Anda"
                  sx={{
                    width: 66,
                    height: 66,
                    border: '4px solid',
                    borderColor: 'background.paper',
                    boxShadow: theme.shadows[3],
                    bgcolor: isAuthenticated ? 'primary.main' : 'grey.200',
                    color: isAuthenticated ? 'primary.contrastText' : 'grey.600'
                  }}>
                  
                  {isAuthenticated ? initials : <PersonOutlineRoundedIcon aria-hidden="true" sx={{ fontSize: 32 }} />}
                </Avatar>
              </Box>
              <Paper elevation={2} sx={{ px: 1.5, py: 0.75, borderRadius: 10 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Lokasi Anda
                </Typography>
              </Paper>
            </Stack>
          </Box>

          <Button
            variant="contained"
            startIcon={<MyLocationRoundedIcon />}
            aria-label="Pusatkan kembali peta ke lokasi saya"
            disabled={mapStatus === 'loading' || sosSending}
            sx={{
              position: 'absolute',
              zIndex: 4,
              right:
              isVolunteer && !assistancePanelExpanded ?
              { xs: 104, md: 112 } :
              { xs: 16, md: 24 },
              bottom: assistancePanelExpanded ?
              { xs: 'calc(46dvh + 16px)', sm: 'calc(44dvh + 16px)', md: 'calc(42dvh + 16px)' } :
              184,
              minHeight: 48,
              borderRadius: 2.5,
              boxShadow: theme.shadows[3],
              transition: theme.transitions.create(['right', 'bottom'], {
                duration: theme.transitions.duration.shorter
              })
            }}>
            
            Lokasi saya
          </Button>

          <Paper
            elevation={1}
            sx={{
              position: 'absolute',
              zIndex: 4,
              left: { xs: 16, md: 24 },
              bottom: assistancePanelExpanded ?
              { xs: 'calc(46dvh + 16px)', sm: 'calc(44dvh + 16px)', md: 'calc(42dvh + 16px)' } :
              96,
              px: 1.5,
              py: 1,
              borderRadius: 2.5
            }}>
            
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationOnRoundedIcon color="primary" fontSize="small" />
              <Box>
                <Typography variant="caption" display="block" sx={{ fontWeight: 700 }}>
                  {location?.address.suburb ?? ''}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Akurasi ±12 meter
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Container>
      </Box>

      {isVolunteer ?
      <VolunteerAssistanceSheet
        expanded={assistancePanelExpanded}
        onExpandedChange={setAssistancePanelExpanded}
        onOpenRequest={() => navigate('/permintaan-masuk')}
        onSeeAllRequests={() => navigate('/permintaan-masuk')}
        onSeeAllVolunteers={() => navigate('/relawan-terdekat')}
        onRequestBackup={() => navigate('/bantuan-relawan')} /> :


      <SeekerAssistanceSheet
        expanded={assistancePanelExpanded}
        onExpandedChange={setAssistancePanelExpanded}
        onRequestHelp={handleRequestHelp}
        onSeeAllVolunteers={() => navigate('/relawan-terdekat')} />

      }

      <Stack
        alignItems="center"
        spacing={0.5}
        sx={{ position: 'fixed', zIndex: 30, right: { xs: 20, md: 32 }, bottom: { xs: 96, md: 104 } }}>
        
        <Badge
          badgeContent={isSosDisabled ? 'Nonaktif' : null}
          overlap="circular"
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            '& .MuiBadge-badge': {
              minWidth: 0,
              height: 20,
              px: 0.75,
              borderRadius: 10,
              bgcolor: 'grey.700',
              color: 'common.white',
              border: '2px solid',
              borderColor: 'background.default',
              fontSize: '0.625rem',
              fontWeight: 800,
              letterSpacing: '0.02em',
              transform: 'translate(24%, -18%)'
            }
          }}>
          
          <Fab
            aria-label={isSosDisabled ? 'SOS darurat — nonaktif selama testing' : 'SOS darurat'}
            onClick={sendSosSignal}
            disabled={sosSending}
            disableRipple={isSosDisabled}
            sx={{
              width: 68,
              height: 68,
              bgcolor: isSosDisabled ? 'grey.500' : 'sos.main',
              color: isSosDisabled ? 'grey.100' : 'sos.contrastText',
              opacity: isSosDisabled ? 0.62 : 1,
              border: '3px solid',
              borderColor: 'background.default',
              boxShadow: isSosDisabled ?
              `0 5px 14px ${alpha(theme.palette.common.black, isDark ? 0.32 : 0.16)}` :
              isDark ?
              `0 0 0 2px ${theme.palette.sos.main}, 0 8px 20px ${alpha(theme.palette.common.black, 0.6)}` :
              `0 8px 20px ${alpha(theme.palette.common.black, 0.28)}`,
              transition: isSosDisabled ? 'none' : undefined,
              '&:hover': isSosDisabled ?
              { bgcolor: 'grey.500', opacity: 0.7 } :
              { bgcolor: 'sos.main', filter: 'brightness(0.94)' },
              '&:focus-visible': isSosDisabled ?
              { outline: '3px solid', outlineColor: 'grey.700', outlineOffset: 2 } :
              undefined
            }}>
            
            <EmergencyRoundedIcon sx={{ fontSize: 32 }} />
          </Fab>
        </Badge>
        <Paper
          elevation={isSosDisabled ? 0 : 1}
          sx={{
            px: 1,
            py: 0.35,
            borderRadius: 1.5,
            border: '2px solid',
            borderColor: isSosDisabled ? 'grey.400' : 'sos.main',
            color: isSosDisabled ? 'text.secondary' : 'text.primary',
            bgcolor: 'background.paper'
          }}>
          
          <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.04em' }}>
            SOS
          </Typography>
        </Paper>
      </Stack>

      <Snackbar
        open={sosDisabledNoticeOpen}
        autoHideDuration={5000}
        onClose={() => setSosDisabledNoticeOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        
        <Alert
          severity="info"
          variant="outlined"
          icon={false}
          onClose={() => setSosDisabledNoticeOpen(false)}
          sx={{ bgcolor: 'background.paper', color: 'text.primary', borderColor: 'grey.400' }}>
          
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Tombol SOS tidak bisa digunakan selama masa testing.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Fitur ini akan aktif kembali setelah proses pengujian selesai.
          </Typography>
        </Alert>
      </Snackbar>

      <Snackbar open={sosNoticeOpen} autoHideDuration={5000} onClose={dismissSosNotice}>
        <Alert severity="info" variant="filled" onClose={dismissSosNotice}>
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            Fitur SOS belum diaktifkan
          </Typography>
          <Typography variant="caption">
            Slot ini disiapkan untuk alur darurat pada layar berikutnya.
          </Typography>
        </Alert>
      </Snackbar>

      {sosFailureOpen &&
      <SosSignalFailureScreen
        onRetry={sendSosSignal}
        retrying={sosSending}
        onDismiss={dismissSosFailure} />

      }

      <MailboxDrawer open={mailboxOpen} onClose={() => setMailboxOpen(false)} />
    </Box>);

}

function MapPlaceholder() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const road = theme.palette.background.paper;
  const roadEdge = theme.palette.divider;
  const block = alpha(theme.palette.success.main, isDark ? 0.22 : 0.16);

  return (
    <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, opacity: isDark ? 0.92 : 1 }}>
      {[10, 31, 53, 76].map((top, index) =>
      <Box
        key={`road-h-${top}`}
        sx={{
          position: 'absolute',
          top: `${top}%`,
          left: '-5%',
          width: '110%',
          height: index === 2 ? 22 : 14,
          bgcolor: road,
          borderTop: `1px solid ${roadEdge}`,
          borderBottom: `1px solid ${roadEdge}`,
          transform: index % 2 === 0 ? 'rotate(-2deg)' : 'rotate(2deg)'
        }} />

      )}
      {[12, 38, 67, 88].map((left, index) =>
      <Box
        key={`road-v-${left}`}
        sx={{
          position: 'absolute',
          left: `${left}%`,
          top: '-10%',
          width: index === 1 ? 20 : 13,
          height: '120%',
          bgcolor: road,
          borderLeft: `1px solid ${roadEdge}`,
          borderRight: `1px solid ${roadEdge}`,
          transform: index % 2 === 0 ? 'rotate(5deg)' : 'rotate(-4deg)'
        }} />

      )}
      {[
      { left: '18%', top: '20%', width: 110, height: 78 },
      { left: '45%', top: '14%', width: 140, height: 62 },
      { left: '72%', top: '29%', width: 120, height: 88 },
      { left: '22%', top: '64%', width: 150, height: 74 },
      { left: '62%', top: '70%', width: 130, height: 62 }].
      map((item, index) =>
      <Box
        key={`map-block-${index}`}
        sx={{ position: 'absolute', ...item, bgcolor: block, border: `1px solid ${roadEdge}`, borderRadius: 1 }} />

      )}
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{ position: 'absolute', top: '35%', left: '17%', color: 'text.secondary' }}>
        
        <AccessibilityNewRoundedIcon fontSize="small" />
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          Taman Inklusif
        </Typography>
      </Stack>
    </Box>);

}