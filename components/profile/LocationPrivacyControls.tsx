import React from 'react';
import GpsFixedRoundedIcon from '@mui/icons-material/GpsFixedRounded';
import GpsNotFixedRoundedIcon from '@mui/icons-material/GpsNotFixedRounded';
import {
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography } from
'@mui/material';

import { LocationPrecision, LocationPrivacySettings } from '../../types/profile';

interface LocationPrivacyControlsProps {
  settings: LocationPrivacySettings;
  onUpdateSetting: <Key extends keyof LocationPrivacySettings>(
  key: Key,
  value: LocationPrivacySettings[Key])
  => void;
}

export function LocationPrivacyControls({ settings, onUpdateSetting }: LocationPrivacyControlsProps) {
  return (
    <Stack spacing={2.5}>
      <FormControlLabel
        control={
        <Switch
          checked={settings.shareWhileRequesting}
          onChange={(event) => onUpdateSetting('shareWhileRequesting', event.target.checked)} />

        }
        label={
        <Stack>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              Bagikan lokasi saat meminta bantuan
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Lokasi hanya dibagikan ke relawan yang menerima permintaan Anda.
            </Typography>
          </Stack>
        }
        sx={{ minHeight: 48, ml: 0 }} />
      

      <Divider />

      <Stack spacing={1}>
        <Typography variant="body1" sx={{ fontWeight: 700 }}>
          Tingkat ketelitian lokasi
        </Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          value={settings.precision}
          onChange={(_event, value) => value && onUpdateSetting('precision', value as LocationPrecision)}
          aria-label="Tingkat ketelitian lokasi yang dibagikan"
          disabled={!settings.shareWhileRequesting}>
          
          <ToggleButton value="exact" sx={{ minHeight: 56, gap: 1, fontWeight: 700 }}>
            <GpsFixedRoundedIcon />
            Titik tepat
          </ToggleButton>
          <ToggleButton value="approximate" sx={{ minHeight: 56, gap: 1, fontWeight: 700 }}>
            <GpsNotFixedRoundedIcon />
            Perkiraan area
          </ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="caption" color="text.secondary">
          {settings.precision === 'exact' ?
          'Relawan melihat titik lokasi Anda secara tepat agar bantuan lebih cepat.' :
          'Relawan hanya melihat radius sekitar 300 meter dari lokasi Anda.'}
        </Typography>
      </Stack>

      <Divider />

      <FormControlLabel
        control={
        <Switch
          checked={settings.visibleInNearbyList}
          onChange={(event) => onUpdateSetting('visibleInNearbyList', event.target.checked)} />

        }
        label={
        <Stack>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              Tampil di daftar terdekat
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Profil Anda dapat muncul untuk pengguna lain di sekitar.
            </Typography>
          </Stack>
        }
        sx={{ minHeight: 48, ml: 0 }} />
      

      <FormControlLabel
        control={
        <Switch
          checked={settings.keepLocationHistory}
          onChange={(event) => onUpdateSetting('keepLocationHistory', event.target.checked)} />

        }
        label={
        <Stack>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              Simpan riwayat lokasi
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Riwayat perjalanan bantuan disimpan maksimal 30 hari untuk audit.
            </Typography>
          </Stack>
        }
        sx={{ minHeight: 48, ml: 0 }} />
      
    </Stack>);

}