import React, { KeyboardEvent } from 'react';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import { motion, PanInfo, useReducedMotion } from 'framer-motion';

import { MapPinPosition } from '../../types/helpRequest';

interface DraggableLocationMapProps {
  position: MapPinPosition;
  addressLabel: string;
  onPositionChange: (position: MapPinPosition) => void;
}

const LIMIT_X = 110;
const LIMIT_Y = 62;

export function DraggableLocationMap({ position, addressLabel, onPositionChange }: DraggableLocationMapProps) {
  const reduceMotion = useReducedMotion();

  const clampPosition = (x: number, y: number): MapPinPosition => ({
    x: Math.max(-LIMIT_X, Math.min(LIMIT_X, x)),
    y: Math.max(-LIMIT_Y, Math.min(LIMIT_Y, y))
  });

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    onPositionChange(clampPosition(position.x + info.offset.x, position.y + info.offset.y));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const increments: Record<string, MapPinPosition> = {
      ArrowLeft: { x: -8, y: 0 },
      ArrowRight: { x: 8, y: 0 },
      ArrowUp: { x: 0, y: -8 },
      ArrowDown: { x: 0, y: 8 }
    };
    const increment = increments[event.key];
    if (!increment) return;
    event.preventDefault();
    onPositionChange(clampPosition(position.x + increment.x, position.y + increment.y));
  };

  return (
    <Box
      role="region"
      aria-label="Peta penyesuaian lokasi"
      sx={{
        position: 'relative',
        height: { xs: 260, sm: 310 },
        overflow: 'hidden',
        borderRadius: 3,
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#15191C' : '#DDE7DF',
        border: '1px solid',
        borderColor: 'divider'
      }}>
      
      <MapRoads />
      <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
        <motion.div
          drag
          dragConstraints={{ left: -LIMIT_X, right: LIMIT_X, top: -LIMIT_Y, bottom: LIMIT_Y }}
          dragElastic={0.04}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          initial={false}
          animate={{ x: position.x, y: position.y }}
          transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 36 }}
          style={{ touchAction: 'none' }}>
          
          <Stack alignItems="center" spacing={0.25}>
            <IconButton
              aria-label="Geser pin lokasi. Gunakan tombol panah untuk penyesuaian presisi"
              onKeyDown={handleKeyDown}
              sx={{
                width: 64,
                height: 64,
                color: 'primary.contrastText',
                bgcolor: 'primary.main',
                border: '4px solid',
                borderColor: 'background.paper',
                boxShadow: '0 6px 18px rgba(0,0,0,.28)',
                cursor: 'grab',
                '&:hover': { bgcolor: 'primary.dark' },
                '&:active': { cursor: 'grabbing' }
              }}>
              
              <LocationOnRoundedIcon fontSize="large" />
            </IconButton>
            <DragIndicatorRoundedIcon color="primary" aria-hidden="true" />
          </Stack>
        </motion.div>
      </Box>

      <Paper elevation={1} sx={{ position: 'absolute', left: 12, bottom: 12, px: 1.25, py: 0.75, borderRadius: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 800 }}>
          {addressLabel}
        </Typography>
      </Paper>
    </Box>);

}

function MapRoads() {
  return (
    <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, opacity: 0.85 }}>
      {[22, 53, 78].map((top, index) =>
      <Box
        key={top}
        sx={{
          position: 'absolute',
          top: `${top}%`,
          left: '-5%',
          width: '110%',
          height: index === 1 ? 22 : 14,
          bgcolor: 'background.paper',
          transform: index % 2 ? 'rotate(2deg)' : 'rotate(-3deg)',
          borderBlock: '1px solid',
          borderColor: 'divider'
        }} />

      )}
      {[18, 47, 79].map((left, index) =>
      <Box
        key={left}
        sx={{
          position: 'absolute',
          left: `${left}%`,
          top: '-10%',
          height: '120%',
          width: index === 1 ? 20 : 13,
          bgcolor: 'background.paper',
          transform: index % 2 ? 'rotate(-4deg)' : 'rotate(4deg)',
          borderInline: '1px solid',
          borderColor: 'divider'
        }} />

      )}
    </Box>);

}