import React, { useState } from 'react';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import { Button, Card, FormControlLabel, Stack, Switch, Typography } from '@mui/material';

import { voiceCommandExamples } from '../../data/voiceCommands';

interface VoiceCommandControlProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  /** Greys out the control while the feature is still in development. */
  disabled?: boolean;
}

export function VoiceCommandControl({ enabled, onEnabledChange, disabled = false }: VoiceCommandControlProps) {
  const [showExamples, setShowExamples] = useState(false);

  return (
    <Stack spacing={2}>
      <FormControlLabel
        disabled={disabled}
        control={
        <Switch checked={enabled} disabled={disabled} onChange={(event) => onEnabledChange(event.target.checked)} />
        }
        label={
        <Stack>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              Perintah suara {enabled ? 'aktif' : 'nonaktif'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Aktifkan untuk memanggil bantuan tanpa menyentuh layar.
            </Typography>
          </Stack>
        }
        sx={{ minHeight: 48, alignItems: 'center', ml: 0 }} />
      

      <Button
        variant="outlined"
        startIcon={<MicRoundedIcon />}
        onClick={() => setShowExamples((current) => !current)}
        aria-expanded={showExamples}
        disabled={disabled || !enabled}
        sx={{ minHeight: 56, borderRadius: 2.5, alignSelf: 'flex-start' }}>
        
        {showExamples ? 'Sembunyikan Contoh Perintah' : 'Coba Perintah Suara'}
      </Button>

      {showExamples && enabled && !disabled &&
      <Stack spacing={1.5} aria-live="polite">
          {voiceCommandExamples.map((example) =>
        <Card key={example.command} variant="outlined" sx={{ p: 1.75, borderRadius: 2.5 }}>
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <GraphicEqRoundedIcon color="primary" fontSize="small" sx={{ mt: 0.25 }} />
                <Stack>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {example.command}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {example.outcome}
                  </Typography>
                </Stack>
              </Stack>
            </Card>
        )}
        </Stack>
      }
    </Stack>);

}