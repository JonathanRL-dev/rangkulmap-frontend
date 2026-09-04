import React, { useEffect, useRef } from 'react';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { Box, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion, useReducedMotion } from 'framer-motion';

import { RewardIcon } from './RewardIcon';
import { ProgressionLevel } from '../../types/progression';

const MotionBox = motion(Box);
const ITEM_WIDTH = 78;
const NODE_CENTER = 24;

interface CompactLevelPathProps {
  levels: ProgressionLevel[];
  currentLevel: number;
}

export function CompactLevelPath({ levels, currentLevel }: CompactLevelPathProps) {
  const theme = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const currentItemRef = useRef<HTMLDivElement | null>(null);
  const orderedLevels = [...levels].sort((first, second) => first.level - second.level);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const currentItem = currentItemRef.current;

    if (!container || !currentItem) return;

    container.scrollTo({
      left: Math.max(0, currentItem.offsetLeft - container.clientWidth / 2 + currentItem.clientWidth / 2),
      behavior: 'auto'
    });
  }, []);

  return (
    <Box
      ref={scrollContainerRef}
      aria-label="Ringkasan jalur level, dari level awal di kiri menuju level tertinggi di kanan"
      sx={{
        overflowX: 'auto',
        overflowY: 'hidden',
        pb: 1,
        overscrollBehaviorX: 'contain',
        scrollBehavior: shouldReduceMotion ? 'auto' : 'smooth'
      }}>
      
      <Stack direction="row" sx={{ width: 'max-content', px: 0.5, pt: 1.5 }}>
        {orderedLevels.map((level, index) => {
          const isCurrent = level.status === 'current';
          const isCompleted = level.status === 'completed';
          const isLocked = level.status === 'locked';
          const statusLabel = isCompleted ? 'Selesai' : isCurrent ? 'Level saat ini' : 'Terkunci';
          const lineColor = level.level <= currentLevel ? theme.palette.success.main : theme.palette.divider;

          return (
            <Box
              key={level.level}
              ref={isCurrent ? currentItemRef : undefined}
              sx={{ position: 'relative', width: ITEM_WIDTH, flexShrink: 0 }}>
              
              <Box
                aria-hidden="true"
                sx={{
                  position: 'absolute',
                  top: NODE_CENTER - 2,
                  left: index === 0 ? '50%' : 0,
                  right: index === orderedLevels.length - 1 ? '50%' : 0,
                  height: 4,
                  bgcolor: lineColor,
                  borderRadius: 2
                }} />
              

              <Stack alignItems="center" spacing={0.75}>
                <Tooltip title={`Level ${level.level} · ${level.name} · ${statusLabel}`} arrow>
                  <Box
                    role="img"
                    aria-label={`Level ${level.level}, ${level.name}, ${statusLabel}${level.reward ? `, hadiah ${level.reward.title}` : ''}`}
                    sx={{
                      position: 'relative',
                      display: 'grid',
                      placeItems: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      border: '3px solid',
                      borderColor: isCompleted ?
                      'success.main' :
                      isCurrent ?
                      'warning.main' :
                      alpha(theme.palette.text.secondary, 0.45),
                      bgcolor: isCompleted ? 'success.main' : isCurrent ? 'warning.main' : 'background.paper',
                      color: isCompleted ? 'success.contrastText' : isCurrent ? 'warning.contrastText' : 'text.secondary',
                      boxShadow: isCurrent ? theme.shadows[2] : 'none',
                      zIndex: 1
                    }}>
                    
                    {isCurrent &&
                    <MotionBox
                      aria-hidden="true"
                      animate={shouldReduceMotion ? undefined : { scale: [1, 1.3], opacity: [0.75, 0] }}
                      transition={shouldReduceMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                      sx={{
                        position: 'absolute',
                        inset: -8,
                        border: '3px solid',
                        borderColor: 'warning.main',
                        borderRadius: '50%'
                      }} />

                    }
                    {isLocked ?
                    <Stack alignItems="center" spacing={0}>
                        <LockRoundedIcon aria-hidden="true" sx={{ fontSize: 14 }} />
                        <Typography component="span" variant="caption" sx={{ fontWeight: 800, lineHeight: 1 }}>
                          {level.level}
                        </Typography>
                      </Stack> :

                    <Typography component="span" variant="body1" sx={{ fontWeight: 800 }}>
                        {level.level}
                      </Typography>
                    }
                  </Box>
                </Tooltip>

                <Box sx={{ height: 28, display: 'grid', placeItems: 'center' }}>
                  {level.reward &&
                  <Tooltip title={level.reward.title} arrow>
                      <Paper
                      role="img"
                      aria-label={`Hadiah Level ${level.level}: ${level.reward.title}`}
                      elevation={0}
                      sx={{
                        display: 'grid',
                        placeItems: 'center',
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        border: '2px solid',
                        borderColor: isLocked ? 'divider' : 'warning.main',
                        bgcolor: isLocked ? 'background.paper' : 'warning.main',
                        color: isLocked ? 'text.secondary' : 'warning.contrastText'
                      }}>
                      
                        <RewardIcon type={level.reward.type} />
                      </Paper>
                    </Tooltip>
                  }
                </Box>
              </Stack>
            </Box>);

        })}
      </Stack>
    </Box>);

}