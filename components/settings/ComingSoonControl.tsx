import React, { KeyboardEvent } from 'react';
import { Box } from '@mui/material';

interface ComingSoonControlProps {
  /** Name of the setting, announced to screen readers. */
  label: string;
  onNotify: () => void;
  children: React.ReactNode;
}

/**
 * Keeps a disabled setting visible and still responsive: touching, clicking, or
 * activating it with the keyboard explains that the feature is on the way.
 */
export function ComingSoonControl({ label, onNotify, children }: ComingSoonControlProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onNotify();
  };

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={`${label} belum tersedia. Aktifkan untuk melihat keterangan.`}
      onClick={onNotify}
      onKeyDown={handleKeyDown}
      sx={{
        borderRadius: 2.5,
        cursor: 'not-allowed',
        '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: 4 }
      }}>
      
      {children}
    </Box>);

}