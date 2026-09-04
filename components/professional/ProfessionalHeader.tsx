import React from 'react';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Box, Container, IconButton, Paper, Stack, Typography } from '@mui/material';

interface ProfessionalHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export function ProfessionalHeader({ title, subtitle, onBack }: ProfessionalHeaderProps) {
  return (
    <Paper component="header" square elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: 1.75 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {onBack ?
          <IconButton aria-label="Kembali" onClick={onBack}>
              <ArrowBackRoundedIcon />
            </IconButton> :

          <Box sx={{ width: 48, height: 48 }} aria-hidden="true" />
          }
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h1" variant="h2" noWrap>
              {title}
            </Typography>
            {subtitle &&
            <Typography variant="body1" color="text.secondary" noWrap>
                {subtitle}
              </Typography>
            }
          </Box>
        </Stack>
      </Container>
    </Paper>);

}