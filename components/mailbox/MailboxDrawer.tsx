import React, { useEffect } from 'react';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LocalActivityRoundedIcon from '@mui/icons-material/LocalActivityRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Typography,
  useMediaQuery } from
'@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { toast } from 'sonner';

import { InlineResourceError } from '../feedback/InlineResourceError';
import { MailboxSkeleton } from '../feedback/MailboxSkeleton';
import { useErrorHandling } from '../../contexts/ErrorHandlingContext';
import { useMailbox } from '../../contexts/MailboxContext';
import { MailboxReward } from '../../types/mailbox';

interface MailboxDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MailboxDrawer({ open, onClose }: MailboxDrawerProps) {
  const theme = useTheme();
  const isWideScreen = useMediaQuery(theme.breakpoints.up('sm'));
  const { unclaimedRewards, claimedRewards, claimReward, status, isClaiming, retry } = useMailbox();
  const { showErrorToast } = useErrorHandling();

  useEffect(() => {
    if (open && status === 'error') {
      showErrorToast('Gagal memuat Mailbox', 'Daftar hadiah belum dapat diambil. Coba lagi.');
    }
  }, [open, showErrorToast, status]);

  const handleClaim = (item: MailboxReward) => {
    void claimReward(item.level).then((claimed) => {
      if (!claimed) {
        showErrorToast('Gagal mengklaim hadiah', 'Periksa penyimpanan perangkat lalu coba lagi.');
        return;
      }

      toast.success('Hadiah berhasil diklaim', {
        description: `${item.reward.title} dari Level ${item.level} sudah masuk ke koleksimu.`
      });
    });
  };

  return (
    <Drawer
      anchor={isWideScreen ? 'right' : 'bottom'}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        role: 'dialog',
        'aria-labelledby': 'mailbox-title',
        'aria-describedby': 'mailbox-description',
        sx: {
          width: isWideScreen ? 460 : '100%',
          maxWidth: '100%',
          height: isWideScreen ? '100%' : 'auto',
          maxHeight: isWideScreen ? '100%' : '90dvh',
          borderRadius: isWideScreen ? 0 : '24px 24px 0 0'
        }
      }}>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 1.25, sm: 2.5 }, pb: 2 }}>
          {!isWideScreen &&
          <Box aria-hidden="true" sx={{ width: 48, height: 5, borderRadius: 10, bgcolor: 'divider', mx: 'auto', mb: 2 }} />
          }
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                ZONA B · HADIAH LEVEL
              </Typography>
              <Typography id="mailbox-title" component="h2" variant="h2">
                Mailbox
              </Typography>
              <Typography id="mailbox-description" variant="body2" color="text.secondary">
                Klaim hadiah dari perjalanan baikmu.
              </Typography>
            </Box>
            <IconButton aria-label="Tutup Mailbox" onClick={onClose}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
          {status === 'loading' && open ?
          <MailboxSkeleton /> :
          status === 'error' && open ?
          <InlineResourceError
            title="Gagal memuat Mailbox"
            description="Daftar hadiah belum dapat diambil. Periksa koneksi lalu coba lagi."
            onRetry={retry} /> :


          <Stack spacing={3}>
            <Box component="section" aria-labelledby="new-rewards-title">
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 1.5 }}>
                <Typography id="new-rewards-title" component="h3" variant="h3">
                  Hadiah Baru
                </Typography>
                <Chip label={`${unclaimedRewards.length} belum diklaim`} color="warning" size="small" />
              </Stack>

              {unclaimedRewards.length > 0 ?
              <Stack spacing={1.5}>
                  {unclaimedRewards.map((item) =>
                <Paper
                  key={item.level}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    borderColor: (activeTheme) => alpha(activeTheme.palette.warning.main, 0.55),
                    bgcolor: (activeTheme) => alpha(activeTheme.palette.warning.main, activeTheme.palette.mode === 'dark' ? 0.08 : 0.06)
                  }}>
                  
                      <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                        <Box
                      role="img"
                      aria-label={`Ikon hadiah ${item.reward.title}`}
                      sx={{
                        display: 'grid',
                        placeItems: 'center',
                        width: 46,
                        height: 46,
                        flexShrink: 0,
                        borderRadius: '50%',
                        bgcolor: 'warning.main',
                        color: 'warning.contrastText'
                      }}>
                      
                          {getRewardIcon(item)}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body1" sx={{ fontWeight: 800 }}>
                            {item.reward.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Dari Level {item.level} · {item.levelName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {item.reward.description}
                          </Typography>
                          <Button
                        fullWidth
                        variant="contained"
                        color="warning"
                        onClick={() => handleClaim(item)}
                        disabled={isClaiming}
                        sx={{ mt: 1.5 }}>
                        
                            Klaim
                          </Button>
                        </Box>
                      </Stack>
                    </Paper>
                )}
                </Stack> :

              <Paper
                variant="outlined"
                sx={{ p: 3, borderRadius: 3, textAlign: 'center', borderStyle: 'dashed' }}>
                
                  <Box
                  role="img"
                  aria-label="Karakter Circle-Mon tersenyum dan menyemangati"
                  sx={{
                    position: 'relative',
                    display: 'grid',
                    placeItems: 'center',
                    width: 104,
                    height: 104,
                    mx: 'auto',
                    mb: 2,
                    borderRadius: '50%',
                    border: '5px solid',
                    borderColor: 'warning.main',
                    bgcolor: (activeTheme) => alpha(activeTheme.palette.warning.main, 0.16)
                  }}>
                  
                    <Stack direction="row" spacing={2} aria-hidden="true" sx={{ position: 'absolute', top: 32 }}>
                      <Box sx={{ width: 10, height: 14, borderRadius: '50%', bgcolor: 'text.primary' }} />
                      <Box sx={{ width: 10, height: 14, borderRadius: '50%', bgcolor: 'text.primary' }} />
                    </Stack>
                    <Box
                    aria-hidden="true"
                    sx={{
                      position: 'absolute',
                      top: 58,
                      width: 34,
                      height: 16,
                      borderBottom: '4px solid',
                      borderColor: 'text.primary',
                      borderRadius: '0 0 50% 50%'
                    }} />
                  
                    <Box
                    aria-hidden="true"
                    sx={{
                      position: 'absolute',
                      right: -6,
                      top: 4,
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      border: '3px solid',
                      borderColor: 'background.paper'
                    }} />
                  
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 800 }}>
                    Belum ada hadiah baru, terus bantu sesama untuk naik level!
                  </Typography>
                </Paper>
              }
            </Box>

            {claimedRewards.length > 0 &&
            <Box component="section" aria-labelledby="claim-history-title">
                <Typography id="claim-history-title" component="h3" variant="h3" sx={{ mb: 1.5 }}>
                  Riwayat Klaim
                </Typography>
                <Stack spacing={1}>
                  {claimedRewards.map((item) =>
                <Paper
                  key={item.level}
                  variant="outlined"
                  sx={{ p: 1.5, borderRadius: 2.5, opacity: 0.62, bgcolor: 'action.disabledBackground' }}>
                  
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box sx={{ display: 'flex', color: 'success.main' }}>
                          <CheckCircleRoundedIcon aria-hidden="true" />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {item.reward.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Diklaim dari Level {item.level}
                          </Typography>
                        </Box>
                        <Chip label="Diklaim" size="small" icon={<CheckCircleRoundedIcon />} />
                      </Stack>
                    </Paper>
                )}
                </Stack>
              </Box>
            }
          </Stack>
          }
        </Box>
      </Box>
    </Drawer>);

}

function getRewardIcon(item: MailboxReward): React.ReactNode {
  if (item.reward.type === 'voucher') return <LocalActivityRoundedIcon aria-hidden="true" />;
  if (item.reward.type === 'badge') return <WorkspacePremiumRoundedIcon aria-hidden="true" />;
  return <AutoAwesomeRoundedIcon aria-hidden="true" />;
}