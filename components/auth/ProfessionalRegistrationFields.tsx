import React, { ChangeEvent } from 'react';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import { Box, Button, FormHelperText, InputAdornment, Stack, TextField, Typography } from '@mui/material';

import { FieldErrorText } from '../feedback/FieldErrorText';

export interface ProfessionalFieldErrors {
  licenseNumber?: string;
  specialization?: string;
  hourlyRate?: string;
  domicile?: string;
  certification?: string;
}

interface ProfessionalRegistrationFieldsProps {
  licenseNumber: string;
  specialization: string;
  hourlyRate: string;
  domicile: string;
  certificationFileName: string;
  errors: ProfessionalFieldErrors;
  onLicenseNumberChange: (value: string) => void;
  onSpecializationChange: (value: string) => void;
  onHourlyRateChange: (value: string) => void;
  onDomicileChange: (value: string) => void;
  onCertificationChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function ProfessionalRegistrationFields({
  licenseNumber,
  specialization,
  hourlyRate,
  domicile,
  certificationFileName,
  errors,
  onLicenseNumberChange,
  onSpecializationChange,
  onHourlyRateChange,
  onDomicileChange,
  onCertificationChange
}: ProfessionalRegistrationFieldsProps) {
  return (
    <Stack spacing={2.5}>
      <TextField
        required
        fullWidth
        label="Nomor lisensi / STR"
        value={licenseNumber}
        onChange={(event) => onLicenseNumberChange(event.target.value)}
        error={Boolean(errors.licenseNumber)}
        helperText={errors.licenseNumber ? <FieldErrorText message={errors.licenseNumber} /> : undefined} />
      
      <TextField
        required
        fullWidth
        label="Spesialisasi"
        value={specialization}
        onChange={(event) => onSpecializationChange(event.target.value)}
        error={Boolean(errors.specialization)}
        helperText={errors.specialization ? <FieldErrorText message={errors.specialization} /> : undefined} />
      
      <TextField
        required
        fullWidth
        type="number"
        label="Tarif per jam"
        value={hourlyRate}
        onChange={(event) => onHourlyRateChange(event.target.value)}
        error={Boolean(errors.hourlyRate)}
        helperText={errors.hourlyRate ? <FieldErrorText message={errors.hourlyRate} /> : 'Masukkan tarif layanan untuk satu jam.'}
        InputProps={{ startAdornment: <InputAdornment position="start">Rp</InputAdornment> }}
        inputProps={{ min: 1, inputMode: 'numeric' }} />
      
      <TextField
        required
        fullWidth
        label="Area domisili"
        value={domicile}
        onChange={(event) => onDomicileChange(event.target.value)}
        error={Boolean(errors.domicile)}
        helperText={errors.domicile ? <FieldErrorText message={errors.domicile} /> : undefined} />
      
      <Box>
        <Button
          component="label"
          variant="outlined"
          fullWidth
          startIcon={<UploadFileRoundedIcon />}
          sx={{
            minHeight: 72,
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: errors.certification ? 'error.main' : undefined,
            color: errors.certification ? 'error.main' : undefined
          }}>
          
          {certificationFileName || 'Unggah Dokumen Sertifikasi / STR'}
          <Box component="input" type="file" accept="image/*,.pdf" hidden onChange={onCertificationChange} />
        </Button>
        {errors.certification ?
        <FormHelperText component="div" error sx={{ mt: 0.75, mx: 0 }}>
            <FieldErrorText message={errors.certification} />
          </FormHelperText> :

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>
            Dokumen digunakan untuk verifikasi dan tidak ditampilkan ke publik.
          </Typography>
        }
      </Box>
    </Stack>);

}