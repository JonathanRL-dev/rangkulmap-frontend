import React from 'react';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import { Box, Card, CardActionArea, Chip, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { roleOptions } from '../../data/authOptions';
import { UserRole } from '../../types/auth';

interface SignUpRoleSelectionProps {
  value: UserRole | null;
  onChange: (role: UserRole) => void;
}

export function SignUpRoleSelection({ value, onChange }: SignUpRoleSelectionProps) {
  const theme = useTheme();

  return (
    <Box
      role="radiogroup"
      aria-label="Pilih peran akun"
      sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
      
      {roleOptions.map((option) => {
        const selected = value === option.id;
        const accentColor = option.accent === 'warning' ?
        theme.palette.warning.main :
        option.accent === 'success' ?
        theme.palette.success.main :
        theme.palette.primary.main;

        return (
          <Card
            key={option.id}
            variant="outlined"
            sx={{
              minHeight: 230,
              borderWidth: selected ? 3 : 1,
              borderColor: selected ? accentColor : 'divider',
              bgcolor: selected ? alpha(accentColor, theme.palette.mode === 'dark' ? 0.14 : 0.08) : 'background.paper'
            }}>
            
            <CardActionArea
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.id)}
              sx={{ height: '100%', p: 2.5, alignItems: 'flex-start' }}>
              
              <Stack spacing={2} alignItems="flex-start">
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: option.id === 'volunteer' ? 2.5 : '50%',
                    bgcolor: alpha(accentColor, 0.18),
                    color: accentColor
                  }}>
                  
                  {option.id === 'volunteer' ?
                  <VolunteerActivismRoundedIcon sx={{ fontSize: 36 }} /> :
                  option.id === 'professional' ?
                  <MedicalServicesRoundedIcon sx={{ fontSize: 36 }} /> :

                  <PersonSearchRoundedIcon sx={{ fontSize: 36 }} />
                  }
                </Box>
                <Box>
                  <Typography component="h2" variant="h3">
                    {option.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    {option.description}
                  </Typography>
                </Box>
                {selected && <Chip icon={<CheckCircleRoundedIcon />} label="Dipilih" color="primary" />}
              </Stack>
            </CardActionArea>
          </Card>);

      })}
    </Box>);

}