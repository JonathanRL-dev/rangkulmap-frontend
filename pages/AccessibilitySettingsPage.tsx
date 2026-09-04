import React, { useState } from 'react';
import AccessibilityNewRoundedIcon from '@mui/icons-material/AccessibilityNewRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import FormatSizeRoundedIcon from '@mui/icons-material/FormatSizeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded';
import SettingsBrightnessRoundedIcon from '@mui/icons-material/SettingsBrightnessRounded';
import TonalityRoundedIcon from '@mui/icons-material/TonalityRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import {
  Alert,
  Box,
  Container,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography } from
'@mui/material';
import { useNavigate } from 'react-router-dom';

import { ComingSoonChip } from '../components/settings/ComingSoonChip';
import { ComingSoonControl } from '../components/settings/ComingSoonControl';
import { SettingsSection } from '../components/settings/SettingsSection';
import { TextSizeControl } from '../components/settings/TextSizeControl';
import { VoiceCommandControl } from '../components/settings/VoiceCommandControl';
import { ColorModePreference, LanguageCode, useAccessibility } from '../contexts/AccessibilityContext';
import { languageOptions } from '../data/voiceCommands';

const COMING_SOON_MESSAGE = 'Fitur ini sedang dalam pengembangan, nantikan update berikutnya';

const MODE_OPTIONS: {value: ColorModePreference;label: string;icon: React.ReactNode;}[] = [
{ value: 'light', label: 'Light', icon: <LightModeRoundedIcon /> },
{ value: 'dark', label: 'Dark', icon: <DarkModeRoundedIcon /> },
{ value: 'system', label: 'Ikuti Sistem', icon: <SettingsBrightnessRoundedIcon /> }];


export function AccessibilitySettingsPage() {
  const navigate = useNavigate();
  const {
    colorModePreference,
    setColorModePreference,
    resolvedMode,
    textSizeLevel,
    setTextSizeLevel,
    highContrast,
    setHighContrast,
    voiceCommandEnabled,
    setVoiceCommandEnabled,
    language,
    setLanguage
  } = useAccessibility();
  const [comingSoonOpen, setComingSoonOpen] = useState(false);

  const notifyComingSoon = () => setComingSoonOpen(true);

  return (
    <Box component="main" sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.default' }}>
      <Paper component="header" square elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, py: 1.75 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton aria-label="Kembali ke Beranda" onClick={() => navigate('/dashboard')}>
              <ArrowBackRoundedIcon />
            </IconButton>
            <Box>
              <Typography component="h1" variant="h2">
                Pengaturan Aksesibilitas
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sesuaikan tampilan dan cara Anda berinteraksi dengan RangkulMap.
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Paper>

      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 4 } }}>
        <Stack spacing={2.5}>
          <SettingsSection
            title="Tampilan Tema"
            description="Dark mode memakai latar hitam penuh dengan permukaan kartu terpisah, bukan hasil inversi warna."
            icon={<TonalityRoundedIcon />}>
            
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={colorModePreference}
              onChange={(_event, value) => value && setColorModePreference(value as ColorModePreference)}
              aria-label="Pilihan tema tampilan"
              sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              
              {MODE_OPTIONS.map((option) =>
              <ToggleButton
                key={option.value}
                value={option.value}
                aria-label={option.label}
                sx={{
                  minHeight: 60,
                  gap: 1,
                  fontWeight: 700,
                  borderWidth: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }
                }}>
                
                  {option.icon}
                  {option.label}
                </ToggleButton>
              )}
            </ToggleButtonGroup>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5 }}>
              Tema aktif saat ini: {resolvedMode === 'dark' ? 'Dark (hitam penuh)' : 'Light'}
            </Typography>
          </SettingsSection>

          <SettingsSection
            title="Ukuran Teks"
            description="Empat tingkat ukuran teks yang langsung diterapkan ke seluruh halaman."
            icon={<FormatSizeRoundedIcon />}>
            
            <TextSizeControl level={textSizeLevel} onLevelChange={setTextSizeLevel} />
          </SettingsSection>

          <SettingsSection
            title="Kontras Tinggi"
            description="Menaikkan kontras teks dan garis batas untuk memenuhi target rasio 7:1."
            icon={<VisibilityRoundedIcon />}>
            
            <FormControlLabel
              control={<Switch checked={highContrast} onChange={(event) => setHighContrast(event.target.checked)} />}
              label={
              <Stack>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    Kontras tinggi {highContrast ? 'aktif' : 'nonaktif'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Target rasio kontras 7:1 untuk semua teks informasi kritis.
                  </Typography>
                </Stack>
              }
              sx={{ minHeight: 48, ml: 0 }} />
            
          </SettingsSection>

          <SettingsSection
            title="Voice Command"
            description="Jalankan aksi penting lewat perintah suara singkat."
            icon={<RecordVoiceOverRoundedIcon />}
            badge={<ComingSoonChip />}>
            
            <ComingSoonControl label="Voice Command" onNotify={notifyComingSoon}>
              <VoiceCommandControl enabled={voiceCommandEnabled} onEnabledChange={setVoiceCommandEnabled} disabled />
            </ComingSoonControl>
          </SettingsSection>

          <SettingsSection
            title="Kompatibilitas Screen Reader"
            description="RangkulMap diuji dengan TalkBack, VoiceOver, dan NVDA."
            icon={<AccessibilityNewRoundedIcon />}>
            
            <Stack spacing={1.25}>
              <Typography variant="body1">
                Seluruh struktur halaman memakai penanda semantik dan urutan fokus keyboard yang jelas, sehingga navigasi
                antar bagian dapat diumumkan dengan benar oleh pembaca layar.
              </Typography>
              <Typography variant="body1">
                Semua elemen non-teks memiliki aria-label deskriptif, termasuk elemen dekoratif dan karakter Geo-Friends
                di Zona Komunitas — contohnya <em>aria-label="Karakter Dino Segitiga: Level Relawan 5"</em>. Ikon
                fungsional selalu disertai label teks yang terlihat, dan status penting tidak pernah disampaikan hanya
                melalui warna.
              </Typography>
            </Stack>
          </SettingsSection>

          <SettingsSection
            title="Bahasa"
            description="Bahasa antarmuka dan panduan perintah suara."
            icon={<TranslateRoundedIcon />}
            badge={<ComingSoonChip />}>
            
            <ComingSoonControl label="Pilihan bahasa" onNotify={notifyComingSoon}>
              <FormControl fullWidth disabled>
                <InputLabel id="language-select-label">Pilihan bahasa</InputLabel>
                <Select
                  labelId="language-select-label"
                  label="Pilihan bahasa"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as LanguageCode)}
                  sx={{ minHeight: 56 }}>
                  
                  {languageOptions.map((option) =>
                  <MenuItem key={option.code} value={option.code} sx={{ minHeight: 48 }}>
                      {option.label}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </ComingSoonControl>
          </SettingsSection>
        </Stack>
      </Container>

      <Snackbar open={comingSoonOpen} autoHideDuration={4000} onClose={() => setComingSoonOpen(false)}>
        <Alert severity="info" variant="filled" onClose={() => setComingSoonOpen(false)} sx={{ maxWidth: 480 }}>
          {COMING_SOON_MESSAGE}
        </Alert>
      </Snackbar>
    </Box>);

}