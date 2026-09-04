import React from 'react';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import { FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';

import { ProfessionalServiceType, ServiceTypeOption } from '../../types/professional';

interface ProfessionalFilterBarProps {
  serviceTypeOptions: ServiceTypeOption[];
  serviceLocations: string[];
  serviceType: ProfessionalServiceType | 'all';
  location: string;
  availableDate: string;
  onServiceTypeChange: (value: ProfessionalServiceType | 'all') => void;
  onLocationChange: (value: string) => void;
  onAvailableDateChange: (value: string) => void;
}

export function ProfessionalFilterBar({
  serviceTypeOptions,
  serviceLocations,
  serviceType,
  location,
  availableDate,
  onServiceTypeChange,
  onLocationChange,
  onAvailableDateChange
}: ProfessionalFilterBarProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{ overflowX: { sm: 'auto' }, pb: 0.5 }}>
      
      <FormControl sx={{ minWidth: { sm: 220 } }}>
        <InputLabel id="filter-service-type-label">Jenis Layanan</InputLabel>
        <Select
          labelId="filter-service-type-label"
          label="Jenis Layanan"
          value={serviceType}
          onChange={(event) => onServiceTypeChange(event.target.value as ProfessionalServiceType | 'all')}
          sx={{ minHeight: 56 }}>
          
          <MenuItem value="all" sx={{ minHeight: 48 }}>
            Semua Layanan
          </MenuItem>
          {serviceTypeOptions.map((option) =>
          <MenuItem key={option.id} value={option.id} sx={{ minHeight: 48 }}>
              {option.label}
            </MenuItem>
          )}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: { sm: 180 } }}>
        <InputLabel id="filter-location-label">Lokasi</InputLabel>
        <Select
          labelId="filter-location-label"
          label="Lokasi"
          value={location}
          onChange={(event) => onLocationChange(event.target.value)}
          sx={{ minHeight: 56 }}>
          
          <MenuItem value="all" sx={{ minHeight: 48 }}>
            Semua Kota
          </MenuItem>
          {serviceLocations.map((city) =>
          <MenuItem key={city} value={city} sx={{ minHeight: 48 }}>
              {city}
            </MenuItem>
          )}
        </Select>
      </FormControl>

      <TextField
        label="Ketersediaan"
        type="date"
        value={availableDate}
        onChange={(event) => onAvailableDateChange(event.target.value)}
        InputLabelProps={{ shrink: true }}
        InputProps={{ startAdornment: <EventRoundedIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
        sx={{ minWidth: { sm: 200 }, '& .MuiInputBase-root': { minHeight: 56 } }} />
      
    </Stack>);

}