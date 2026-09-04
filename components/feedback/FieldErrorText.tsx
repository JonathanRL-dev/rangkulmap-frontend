import React from 'react';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { Box } from '@mui/material';

interface FieldErrorTextProps {
  message: string;
}

/**
 * Inline validation message for form fields. Renders inline elements only so it
 * stays valid inside MUI's FormHelperText paragraph.
 */
export function FieldErrorText({ message }: FieldErrorTextProps) {
  return (
    <Box
      component="span"
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'error.main', fontWeight: 700 }}>
      
      <WarningAmberRoundedIcon aria-hidden="true" sx={{ fontSize: 16 }} />
      <Box component="span">{message}</Box>
    </Box>);

}