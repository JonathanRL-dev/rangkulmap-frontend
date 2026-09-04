import React from 'react';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import NearMeRoundedIcon from '@mui/icons-material/NearMeRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import { Chip, Stack } from '@mui/material';

import { Volunteer } from '../../types/volunteer';
import { averageDistanceMeters, countActive, countReady } from '../../utils/volunteerStats';

interface VolunteerSummaryChipsProps {
  volunteers: Volunteer[];
}

/** Live snapshot of the neighbourhood so the list never reads as empty. */
export function VolunteerSummaryChips({ volunteers }: VolunteerSummaryChipsProps) {
  const chips = [
  {
    key: 'ready',
    label: `${countReady(volunteers)} Siap Membantu`,
    icon: <VolunteerActivismRoundedIcon />,
    color: 'success' as const
  },
  {
    key: 'active',
    label: `${countActive(volunteers)} Aktif Sekarang`,
    icon: <BoltRoundedIcon />,
    color: 'primary' as const
  },
  {
    key: 'distance',
    label: `Rata-rata jarak ${averageDistanceMeters(volunteers)}m`,
    icon: <NearMeRoundedIcon />,
    color: 'default' as const
  }];


  return (
    <Stack
      component="ul"
      direction="row"
      spacing={1}
      aria-label="Ringkasan relawan di sekitar"
      sx={{ listStyle: 'none', p: 0, m: 0, flexWrap: 'wrap', rowGap: 1 }}>
      
      {chips.map((chip) =>
      <Chip
        key={chip.key}
        component="li"
        icon={chip.icon}
        label={chip.label}
        variant={chip.color === 'default' ? 'outlined' : 'filled'}
        color={chip.color}
        sx={{ minHeight: 40, fontWeight: 700 }} />

      )}
    </Stack>);

}