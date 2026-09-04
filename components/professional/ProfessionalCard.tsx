import React from 'react';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { Box, Card, CardActionArea, Chip, Rating, Stack, Typography } from '@mui/material';

import { formatIDR } from '../../utils/currency';
import { Professional } from '../../types/professional';

interface ProfessionalCardProps {
  professional: Professional;
  onSelect: (id: string) => void;
}

export function ProfessionalCard({ professional, onSelect }: ProfessionalCardProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <CardActionArea
        onClick={() => onSelect(professional.id)}
        aria-label={`Lihat profil ${professional.name}, ${professional.specialization}`}
        sx={{ alignItems: 'stretch' }}>
        
        <Box sx={{ position: 'relative', height: { xs: 168, sm: 190 }, bgcolor: 'action.hover' }}>
          <Box
            component="img"
            src={professional.imageUrl}
            alt={`Foto ${professional.name}`}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
          
          {professional.verified &&
          <Chip
            icon={<ShieldRoundedIcon />}
            label="Terverifikasi"
            size="small"
            sx={{
              position: 'absolute',
              left: 12,
              bottom: 12,
              minHeight: 34,
              bgcolor: 'background.paper',
              color: 'text.primary',
              border: '2px solid',
              borderColor: 'success.main',
              fontWeight: 800,
              '& .MuiChip-icon': { color: 'success.main' }
            }} />

          }
        </Box>

        <Stack spacing={0.75} sx={{ p: { xs: 1.75, sm: 2.25 } }}>
          <Typography component="h3" variant="h3" noWrap>
            {professional.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ minHeight: { sm: 48 } }}>
            {professional.specialization}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Rating
              value={professional.rating}
              precision={0.1}
              readOnly
              size="small"
              aria-label={`Rating ${professional.rating} dari 5`}
              sx={{ color: 'primary.main' }} />
            
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              {professional.rating.toFixed(1)} ({professional.reviewCount})
            </Typography>
          </Stack>
          <Typography variant="body1" sx={{ fontWeight: 800, pt: 0.5 }}>
            {formatIDR(professional.hourlyRate)}
            <Typography component="span" variant="caption" color="text.secondary">
              {' '}
              / jam
            </Typography>
          </Typography>
        </Stack>
      </CardActionArea>
    </Card>);

}