import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  /** Optional marker shown beside the title, e.g. a "Segera Hadir" chip. */
  badge?: React.ReactNode;
  children: React.ReactNode;
}

export function SettingsSection({ title, description, icon, badge, children }: SettingsSectionProps) {
  return (
    <Paper component="section" variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
        <Box sx={{ color: 'primary.main', display: 'flex', pt: 0.25 }}>{icon}</Box>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 0.75 }}>
            <Typography component="h2" variant="h3">
              {title}
            </Typography>
            {badge}
          </Stack>
          {description &&
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.25 }}>
              {description}
            </Typography>
          }
        </Box>
      </Stack>
      {children}
    </Paper>);

}