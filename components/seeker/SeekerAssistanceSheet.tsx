import React from 'react';
import PanToolAltRoundedIcon from '@mui/icons-material/PanToolAltRounded';
import { Box, Button, Stack, Typography } from '@mui/material';

import { DraggableSheet } from '../dashboard/DraggableSheet';
import { NearbyVolunteersSection } from '../dashboard/NearbyVolunteersSection';

interface SeekerAssistanceSheetProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onRequestHelp: () => void;
  onSeeAllVolunteers: () => void;
}

export function SeekerAssistanceSheet({
  expanded,
  onExpandedChange,
  onRequestHelp,
  onSeeAllVolunteers
}: SeekerAssistanceSheetProps) {
  return (
    <DraggableSheet
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      collapsedTitle="3 Relawan Aktif di Sekitar"
      expandedTitle="Pilihan Bantuan"
      collapsedLabel="Bilah bantuan terlipat. Ketuk dua kali untuk membuka daftar relawan dan pilihan bantuan"
      expandedLabel="Bilah bantuan terbuka. Ketuk dua kali untuk melipat panel"
      collapsedAction={
      <Button
        variant="contained"
        size="small"
        startIcon={<PanToolAltRoundedIcon />}
        onClick={onRequestHelp}
        sx={{ minHeight: 48, px: { xs: 1.25, sm: 2 }, whiteSpace: 'nowrap' }}>
        
          Minta Bantuan
        </Button>
      }>
      
      <Stack spacing={3.5}>
        <Box component="section" aria-labelledby="quick-actions-title">
          <Typography id="quick-actions-title" component="h2" variant="h3" sx={{ mb: 1.5 }}>
            Apa yang Anda butuhkan?
          </Typography>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={onRequestHelp}
            startIcon={<PanToolAltRoundedIcon />}
            sx={{ minHeight: 64, borderRadius: 3, fontSize: '1.0625rem', boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}>
            
            Minta Bantuan
          </Button>
        </Box>

        <NearbyVolunteersSection
          headingId="seeker-nearby-volunteers-title"
          title="Relawan Aktif Terdekat"
          description="3 relawan tersedia dalam radius 500 m"
          onSeeAll={onSeeAllVolunteers} />
        
      </Stack>
    </DraggableSheet>);

}