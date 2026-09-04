import React, { useState } from 'react';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { Box, Button, Container, IconButton, Paper, Stack, Typography } from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { FullScreenLoadingState } from '../components/feedback/FullScreenLoadingState';
import { ActivityHistoryList } from '../components/profile/ActivityHistoryList';
import { EditUsernameDialog } from '../components/profile/EditUsernameDialog';
import { LocationPrivacyControls } from '../components/profile/LocationPrivacyControls';
import { LogoutConfirmationDialog } from '../components/profile/LogoutConfirmationDialog';
import { ProfileHeaderCard } from '../components/profile/ProfileHeaderCard';
import { CompactLevelPath } from '../components/progression/CompactLevelPath';
import { SettingsSection } from '../components/settings/SettingsSection';
import { useErrorHandling } from '../contexts/ErrorHandlingContext';
import { useVolunteerSession } from '../contexts/VolunteerSessionContext';
import { activityHistory } from '../data/profileActivity';
import { useAuth } from '../hooks/useAuth';
import { useGamifikasi } from '../hooks/useGamifikasi';
import { useLocationPrivacy } from '../hooks/useLocationPrivacy';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, isGuest, isLoading, updateUsername, logout } = useAuth();
  const { progression, trustScore } = useGamifikasi(user?.account_id);
  const { showErrorToast } = useErrorHandling();
  const { endSession } = useVolunteerSession();
  const { settings, updateSetting } = useLocationPrivacy();
  const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  if (isLoading && !user) {
    return <FullScreenLoadingState label="Memuat profil akun" />;
  }

  if (isGuest || !user) {
    return <Navigate to="/masuk" replace />;
  }

  const accountId = user.account_id;
  const initials = user.display_name.
  split(' ').
  slice(0, 2).
  map((part) => part[0]).
  join('').
  toUpperCase();
  const currentLevel = progression.levels.find((level) => level.level === progression.currentLevel);

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
                Profil
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Kelola akun, jejak aktivitas, dan privasi lokasi Anda.
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Paper>

      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 4 } }}>
        <Stack spacing={2.5}>
          <ProfileHeaderCard
            displayName={user.display_name}
            username={user.username}
            roleLabel={user.role === 'volunteer' ? 'Relawan' : user.role === 'professional' ? 'Mitra Profesional' : 'Pencari Bantuan'}
            accountId={accountId}
            avatarUrl={user.avatar_url}
            initials={initials}
            trustScore={trustScore}
            level={progression.currentLevel}
            levelName={currentLevel?.name ?? 'Relawan'}
            onEditUsername={() => setUsernameDialogOpen(true)} />
          

          <SettingsSection
            title="Progression Path"
            description="Ringkasan jalur level Anda. Geser ke samping untuk melihat level lain."
            icon={<RouteRoundedIcon />}>
            
            <CompactLevelPath levels={progression.levels} currentLevel={progression.currentLevel} />
            <Button variant="outlined" onClick={() => navigate('/progression-level')} sx={{ mt: 2 }}>
              Buka Progression Level
            </Button>
          </SettingsSection>

          <SettingsSection
            title="Riwayat Aktivitas"
            description="Termasuk log SOS yang dibatalkan, demi transparansi dan audit."
            icon={<HistoryRoundedIcon />}>
            
            <ActivityHistoryList entries={activityHistory} />
          </SettingsSection>

          <SettingsSection
            title="Privasi Lokasi"
            description="Atur kapan dan seberapa detail lokasi Anda dibagikan."
            icon={<ShieldRoundedIcon />}>
            
            <LocationPrivacyControls settings={settings} onUpdateSetting={updateSetting} />
          </SettingsSection>

          <Box sx={{ pt: 1, pb: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              startIcon={<LogoutRoundedIcon />}
              onClick={() => setLogoutDialogOpen(true)}
              sx={{
                minHeight: 56,
                color: 'text.secondary',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                '&:hover': { borderColor: 'text.secondary', bgcolor: 'action.hover' }
              }}>
              
              Log Out
            </Button>
          </Box>
        </Stack>
      </Container>

      <EditUsernameDialog
        open={usernameDialogOpen}
        currentUsername={user.username}
        accountId={accountId}
        onClose={() => setUsernameDialogOpen(false)}
        onSaveUsername={async (username) => {
          const result = await updateUsername(username);
          if (result.success) {
            toast.success(result.message, { description: `Username baru: @${username}` });
          }
          return result;
        }} />
      

      <LogoutConfirmationDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={() => {
          void (async () => {
            setLogoutDialogOpen(false);
            const sessionCleared = endSession();
            const result = await logout();
            if (!sessionCleared || !result.success) {
              showErrorToast('Data sesi belum terhapus sepenuhnya', 'Anda tetap keluar sebagai Guest. Hapus data situs bila sesi lama muncul kembali.');
            }
            navigate('/dashboard', { replace: true });
          })();
        }} />
      
    </Box>);

}