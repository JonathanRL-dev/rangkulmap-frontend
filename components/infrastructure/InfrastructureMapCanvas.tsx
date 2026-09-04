import React from 'react';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { InfrastructurePoint } from '../../types/infrastructure';
import { CategoryIcon } from './CategoryIcon';

interface InfrastructureMapCanvasProps {
  points: InfrastructurePoint[];
  areaLabel: string;
  cityLabel: string;
  totalCount: number;
  onSelectPoint: (point: InfrastructurePoint) => void;
}

export function InfrastructureMapCanvas({
  points,
  areaLabel,
  cityLabel,
  totalCount,
  onSelectPoint
}: InfrastructureMapCanvasProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const road = isDark ? '#4B5157' : '#FFFFFF';
  const edge = isDark ? '#30363B' : '#C7D1C9';
  const block = isDark ? '#252B2F' : '#CBD8CD';

  return (
    <Box
      role="region"
      aria-label="Peta interaktif infrastruktur inklusif Yogyakarta"
      sx={{ position: 'absolute', inset: 0, overflow: 'hidden', bgcolor: isDark ? '#15191C' : '#DDE7DF' }}>
      
      <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0 }}>
        {[12, 30, 49, 70, 87].map((top, index) =>
        <Box
          key={`horizontal-${top}`}
          sx={{
            position: 'absolute',
            top: `${top}%`,
            left: '-8%',
            width: '116%',
            height: index === 2 ? 26 : 14,
            bgcolor: road,
            borderBlock: `1px solid ${edge}`,
            transform: index % 2 === 0 ? 'rotate(-2.5deg)' : 'rotate(2deg)'
          }} />

        )}
        {[11, 28, 49, 73, 90].map((left, index) =>
        <Box
          key={`vertical-${left}`}
          sx={{
            position: 'absolute',
            left: `${left}%`,
            top: '-8%',
            width: index === 2 ? 22 : 13,
            height: '116%',
            bgcolor: road,
            borderInline: `1px solid ${edge}`,
            transform: index % 2 === 0 ? 'rotate(4deg)' : 'rotate(-3deg)'
          }} />

        )}
        {[
        ['16%', '20%', 126, 74],
        ['35%', '15%', 152, 64],
        ['58%', '18%', 142, 84],
        ['77%', '36%', 118, 78],
        ['19%', '57%', 138, 88],
        ['47%', '67%', 148, 70],
        ['72%', '74%', 126, 68]].
        map(([left, top, width, height], index) =>
        <Box
          key={`block-${index}`}
          sx={{
            position: 'absolute',
            left,
            top,
            width,
            height,
            bgcolor: block,
            border: `1px solid ${edge}`,
            borderRadius: 1
          }} />

        )}
        <Typography
          variant="caption"
          sx={{ position: 'absolute', top: '44%', left: '52%', color: isDark ? '#ABB4BA' : '#607068', fontWeight: 700 }}>
          
          {areaLabel}
        </Typography>
      </Box>

      {points.map((point) => {
        const markerColor = point.verified ? theme.palette.success.main : theme.palette.grey[600];
        return (
          <Stack
            key={point.id}
            alignItems="center"
            sx={{ position: 'absolute', ...point.position, zIndex: 2, transform: 'translate(-50%, -100%)' }}>
            
            <Paper
              elevation={5}
              sx={{
                display: 'grid',
                placeItems: 'center',
                width: 52,
                height: 52,
                borderRadius: '50% 50% 50% 8px',
                transform: 'rotate(-45deg)',
                bgcolor: markerColor,
                border: '3px solid',
                borderColor: 'background.paper'
              }}>
              
              <IconButton
                aria-label={`${point.name}, ${point.verified ? 'terverifikasi' : 'belum terverifikasi'}. Buka detail`}
                onClick={() => onSelectPoint(point)}
                sx={{ color: '#FFFFFF', transform: 'rotate(45deg)', minWidth: 48, minHeight: 48 }}>
                
                <CategoryIcon category={point.category} fontSize="medium" />
              </IconButton>
            </Paper>
          </Stack>);

      })}

      <Paper
        elevation={1}
        sx={{ position: 'absolute', left: 16, bottom: 20, px: 1.5, py: 1, borderRadius: 2.5 }}>
        
        <Stack direction="row" alignItems="center" spacing={1}>
          <LocationOnRoundedIcon color="primary" fontSize="small" />
          <Box>
            <Typography variant="caption" display="block" sx={{ fontWeight: 800 }}>
              {cityLabel}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {totalCount} titik terpetakan
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Box
        aria-label="Legenda status marker"
        sx={{
          position: 'absolute',
          right: 16,
          bottom: 94,
          display: { xs: 'none', sm: 'block' },
          bgcolor: alpha(theme.palette.background.paper, 0.96),
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          px: 1.5,
          py: 1.25
        }}>
        
        <LegendDot color={theme.palette.success.main} label="Terverifikasi" />
        <LegendDot color={theme.palette.grey[600]} label="Belum terverifikasi" />
      </Box>
    </Box>);

}

function LegendDot({ color, label }: {color: string;label: string;}) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ '& + &': { mt: 0.75 } }}>
      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color }} />
      <Typography variant="caption" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
    </Stack>);

}