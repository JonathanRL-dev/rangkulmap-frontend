import React from 'react';
import { Chip } from '@mui/material';

/** Neutral marker for settings that are visible but not shippable yet. */
export function ComingSoonChip() {
  return (
    <Chip
      label="Segera Hadir"
      size="small"
      variant="outlined"
      sx={{
        flexShrink: 0,
        fontWeight: 700,
        color: 'text.secondary',
        borderColor: 'divider',
        bgcolor: 'action.hover'
      }} />);


}