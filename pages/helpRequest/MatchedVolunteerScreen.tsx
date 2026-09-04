import React, { useState } from 'react';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Rating,
  Stack,
  Typography } from
'@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { HelpFlowShell } from '../../components/helpRequest/HelpFlowShell';
import { TrustScoreBadge } from '../../components/shared/TrustScoreBadge';
import { useAuth } from '../../hooks/useAuth';
import { Volunteer } from '../../types/volunteer';

interface MatchedVolunteerScreenProps {
  volunteer: Volunteer;
  onAccept: () => void;
  onFindAnother: () => void;
  onBack: () => void;
  onClose: () => void;
  accepting?: boolean;
}

export function MatchedVolunteerScreen({
  volunteer,
  onAccept,
  onFindAnother,
  onBack,
  onClose,
  accepting = false
}: MatchedVolunteerScreenProps) {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const rating = volunteer.rating ?? 4.9;
  const etaMinutes = volunteer.etaMinutes ?? 4;

  const handleContact = (channel: 'chat' | 'phone') => {
    if (isGuest) {
      setLoginDialogOpen(true);
      return;
    }
    toast.info(channel === 'chat' ? 'Membuka chat dengan relawan' : 'Menghubungi relawan', {
      description: volunteer.name
    });
  };

  return (
    <HelpFlowShell
      step={4}
      title="Relawan ditemukan"
      subtitle="Periksa profil singkat sebelum menerima bantuan."
      onBack={onBack}
      onClose={onClose}>
      
      <Card
        component={motion.article}
        initial={reduceMotion ? false : { opacity: 0, y: 56 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.32, 0.72, 0, 1] }}
        variant="outlined"
        sx={{ borderRadius: 4, overflow: 'hidden' }}>
        
        <Box sx={{ position: 'relative', height: { xs: 250, sm: 330 }, bgcolor: 'action.hover' }}>
          <Box
            component="img"
            src={volunteer.imageUrl}
            alt={`Foto relawan ${volunteer.name}`}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
          
          <Box sx={{ position: 'absolute', left: 16, bottom: 16 }}>
            <TrustScoreBadge trustScore={volunteer.trustScore} size="medium" />
          </Box>
        </Box>

        <Stack spacing={2.25} sx={{ p: { xs: 2, sm: 3 } }}>
          <Box>
            <Typography component="h2" variant="h2">
              {volunteer.name}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.75 }}>
              <Rating
                value={rating}
                precision={0.1}
                readOnly
                aria-label={`Rating ${rating} dari 5 bintang`}
                sx={{ color: 'primary.main' }} />
              
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {rating.toFixed(1)}
              </Typography>
            </Stack>
          </Box>

          <Divider />

          <Stack direction="row" spacing={1.5}>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flex: 1 }}>
              <LocationOnRoundedIcon color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Jarak
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 800 }}>
                  {volunteer.distanceMeters} m
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flex: 1 }}>
              <AccessTimeRoundedIcon color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Perkiraan tiba
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 800 }}>
                  {etaMinutes} menit
                </Typography>
              </Box>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1.5} aria-label="Hubungi relawan">
            <Button
              fullWidth
              variant="outlined"
              startIcon={!isGuest ? <ChatRoundedIcon /> : <LockRoundedIcon fontSize="small" />}
              aria-disabled={isGuest}
              onClick={() => handleContact('chat')}
              sx={
              !isGuest ?
              undefined :
              { color: 'text.disabled', borderColor: 'action.disabled', bgcolor: 'action.disabledBackground' }
              }>
              
              Chat
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={!isGuest ? <PhoneRoundedIcon /> : <LockRoundedIcon fontSize="small" />}
              aria-disabled={isGuest}
              onClick={() => handleContact('phone')}
              sx={
              !isGuest ?
              undefined :
              { color: 'text.disabled', borderColor: 'action.disabled', bgcolor: 'action.disabledBackground' }
              }>
              
              Telepon
            </Button>
          </Stack>

          <Stack spacing={1.5}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<CheckCircleRoundedIcon />}
              onClick={onAccept}
              disabled={accepting}
              sx={{ minHeight: 64, borderRadius: 3 }}>
              
              {accepting ? 'Mengirim permintaan…' : 'Terima'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<RefreshRoundedIcon />}
              onClick={onFindAnother}
              disabled={accepting}
              sx={{ minHeight: 56, borderRadius: 3 }}>
              
              Cari Relawan Lain
            </Button>
          </Stack>
        </Stack>
      </Card>

      <Dialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Masuk untuk menghubungi relawan</DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            Login diperlukan untuk membuka chat atau telepon demi menjaga keamanan kontak relawan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button variant="text" onClick={() => setLoginDialogOpen(false)}>
            Nanti
          </Button>
          <Button variant="contained" onClick={() => navigate('/masuk')}>
            Login Sekarang
          </Button>
        </DialogActions>
      </Dialog>
    </HelpFlowShell>);

}