import React from 'react';
import { Chip, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';

import { VolunteerFilter, VolunteerSort } from '../../utils/volunteerStats';

interface VolunteerListControlsProps {
  filter: VolunteerFilter;
  onFilterChange: (filter: VolunteerFilter) => void;
  sort: VolunteerSort;
  onSortChange: (sort: VolunteerSort) => void;
  counts: Record<VolunteerFilter, number>;
}

const FILTERS: {value: VolunteerFilter;label: string;}[] = [
{ value: 'all', label: 'Semua' },
{ value: 'ready', label: 'Siap Membantu' },
{ value: 'active', label: 'Aktif Sekarang' }];


export function VolunteerListControls({
  filter,
  onFilterChange,
  sort,
  onSortChange,
  counts
}: VolunteerListControlsProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      justifyContent="space-between"
      alignItems={{ sm: 'center' }}>
      
      <Stack
        direction="row"
        spacing={1}
        role="group"
        aria-label="Filter status relawan"
        sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        
        {FILTERS.map((option) => {
          const selected = filter === option.value;
          return (
            <Chip
              key={option.value}
              clickable
              label={`${option.label} (${counts[option.value]})`}
              aria-pressed={selected}
              onClick={() => onFilterChange(option.value)}
              variant={selected ? 'filled' : 'outlined'}
              color={selected ? 'primary' : 'default'}
              sx={{ minHeight: 44, fontWeight: 700, borderWidth: selected ? 0 : 2 }} />);


        })}
      </Stack>

      <FormControl size="small" sx={{ minWidth: 232, flexShrink: 0 }}>
        <InputLabel id="volunteer-sort-label">Urutkan</InputLabel>
        <Select
          labelId="volunteer-sort-label"
          label="Urutkan"
          value={sort}
          onChange={(event) => onSortChange(event.target.value as VolunteerSort)}
          sx={{ minHeight: 48 }}>
          
          <MenuItem value="distance" sx={{ minHeight: 48 }}>
            Jarak Terdekat
          </MenuItem>
          <MenuItem value="trust" sx={{ minHeight: 48 }}>
            Trust Score Tertinggi
          </MenuItem>
        </Select>
      </FormControl>
    </Stack>);

}