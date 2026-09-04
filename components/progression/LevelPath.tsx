import React, { useEffect, useRef } from 'react';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { Box, ButtonBase, Chip, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion, useReducedMotion } from 'framer-motion';

import { RewardIcon } from './RewardIcon';
import { ProgressionLevel, ProgressionZone } from '../../types/progression';

const MotionBox = motion(Box);

interface LevelPathProps {
  levels: ProgressionLevel[];
  zones: ProgressionZone[];
  currentLevel: number;
  selectedLevel: number;
  onSelectLevel: (level: number) => void;
}

export function LevelPath({ levels, zones, currentLevel, selectedLevel, onSelectLevel }: LevelPathProps) {
  const theme = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const currentRowRef = useRef<HTMLDivElement | null>(null);
  const displayedZones = [...zones].reverse();

  useEffect(() => {
    const container = scrollContainerRef.current;
    const currentRow = currentRowRef.current;

    if (!container || !currentRow) return;

    container.scrollTo({
      top: Math.max(0, currentRow.offsetTop - container.clientHeight / 2 + currentRow.clientHeight / 2),
      behavior: 'auto'
    });
  }, []);

  return (
    <Paper
      ref={scrollContainerRef}
      component="section"
      aria-label="Jalur Progression Level dari level awal di bawah menuju level tertinggi di atas"
      elevation={0}
      sx={{
        position: 'relative',
        height: { xs: 610, sm: 700 },
        overflowY: 'auto',
        overflowX: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: (activeTheme) => alpha(activeTheme.palette.warning.main, activeTheme.palette.mode === 'dark' ? 0.07 : 0.05),
        scrollBehavior: shouldReduceMotion ? 'auto' : 'smooth',
        overscrollBehavior: 'contain'
      }}>
      
      <Box sx={{ position: 'relative', minHeight: levels.length * 112 + displayedZones.length * 52, py: 2 }}>
        {displayedZones.map((zone, zoneIndex) => {
          const zoneLevels = levels.filter((level) => level.level >= zone.minLevel && level.level <= zone.maxLevel);
          const zoneColor =
          zone.accent === 'success' ?
          theme.palette.success.main :
          zone.accent === 'primary' ?
          theme.palette.primary.main :
          zone.accent === 'warning' ?
          theme.palette.warning.main :
          theme.palette.text.secondary;

          return (
            <Box
              key={zone.id}
              component="section"
              aria-labelledby={`progression-zone-${zone.id}`}
              sx={{
                bgcolor: alpha(zoneColor, theme.palette.mode === 'dark' ? 0.1 : 0.055),
                borderTop: zoneIndex === 0 ? 0 : '2px solid',
                borderColor: alpha(zoneColor, 0.5)
              }}>
              
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ height: 52, px: { xs: 1.5, sm: 2.5 } }}>
                <Chip
                  id={`progression-zone-${zone.id}`}
                  label={`Zona ${zone.id} · ${zone.name}`}
                  size="small"
                  variant="outlined"
                  sx={{ bgcolor: 'background.paper', borderColor: zoneColor, color: 'text.primary', fontWeight: 800 }} />
                
                <Box aria-hidden="true" sx={{ flex: 1, height: 2, bgcolor: alpha(zoneColor, 0.45) }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Level {zone.minLevel}–{zone.maxLevel}
                </Typography>
              </Stack>

              {zoneLevels.map((level) => {
                const index = levels.findIndex((candidate) => candidate.level === level.level);
                const isLeft = level.level % 2 === 0;
                const isSelected = selectedLevel === level.level;
                const isCurrent = level.status === 'current';
                const isCompleted = level.status === 'completed';
                const statusLabel = isCompleted ? 'Selesai' : isCurrent ? 'Level saat ini' : 'Terkunci';
                const nodeColor = isCompleted ?
                theme.palette.success.main :
                isCurrent ?
                theme.palette.warning.main :
                theme.palette.grey[500];
                const lineColor = level.level <= currentLevel ? theme.palette.success.main : theme.palette.divider;

                return (
                  <Box
                    key={level.level}
                    ref={isCurrent ? currentRowRef : undefined}
                    sx={{ position: 'relative', height: 112 }}>
                    
                    <Box
                      aria-hidden="true"
                      sx={{
                        position: 'absolute',
                        top: index === 0 ? 48 : 0,
                        bottom: index === levels.length - 1 ? 64 : 0,
                        left: 'calc(50% - 2px)',
                        width: 4,
                        bgcolor: lineColor,
                        borderRadius: 2
                      }} />
                    
                    <Box
                      aria-hidden="true"
                      sx={{
                        position: 'absolute',
                        top: 46,
                        left: isLeft ? 'calc(50% - 72px)' : '50%',
                        width: 72,
                        height: 4,
                        bgcolor: lineColor,
                        borderRadius: 2
                      }} />
                    

                    <Stack
                      alignItems="center"
                      spacing={0.5}
                      sx={{
                        position: 'absolute',
                        top: 18,
                        left: isLeft ? 'calc(50% - 72px)' : 'calc(50% + 72px)',
                        width: 116,
                        transform: 'translateX(-50%)'
                      }}>
                      
                      <Tooltip title={`Level ${level.level} · ${level.name} · ${statusLabel}`} arrow>
                        <ButtonBase
                          aria-label={`Level ${level.level}, ${level.name}, Zona ${zone.name}, ${statusLabel}${level.reward ? `, hadiah ${level.reward.title}` : ''}`}
                          aria-pressed={isSelected}
                          onClick={() => onSelectLevel(level.level)}
                          sx={{
                            position: 'relative',
                            width: 58,
                            height: 58,
                            borderRadius: '50%',
                            border: isSelected ? '4px solid' : '3px solid',
                            borderColor: isSelected ? 'primary.main' : nodeColor,
                            bgcolor: isCompleted ? 'success.main' : isCurrent ? 'warning.main' : 'background.paper',
                            color: isCompleted ? 'success.contrastText' : isCurrent ? 'warning.contrastText' : 'text.secondary',
                            boxShadow: isSelected ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.18)}` : theme.shadows[1],
                            zIndex: 2
                          }}>
                          
                          {isCurrent &&
                          <MotionBox
                            aria-hidden="true"
                            animate={shouldReduceMotion ? undefined : { scale: [1, 1.28], opacity: [0.8, 0] }}
                            transition={shouldReduceMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                            sx={{
                              position: 'absolute',
                              inset: -10,
                              border: '3px solid',
                              borderColor: 'warning.main',
                              borderRadius: '50%',
                              pointerEvents: 'none'
                            }} />

                          }
                          {level.status === 'locked' ?
                          <Stack alignItems="center" spacing={0}>
                              <LockRoundedIcon sx={{ fontSize: 16 }} />
                              <Typography component="span" variant="caption" sx={{ fontWeight: 800, lineHeight: 1 }}>
                                {level.level}
                              </Typography>
                            </Stack> :

                          <Typography component="span" variant="body1" sx={{ fontWeight: 800 }}>
                              {level.level}
                            </Typography>
                          }
                        </ButtonBase>
                      </Tooltip>

                      {level.reward &&
                      <Tooltip title={level.reward.title} arrow>
                          <Paper
                          role="img"
                          aria-label={`Hadiah Level ${level.level}: ${level.reward.title}`}
                          elevation={0}
                          sx={{
                            display: 'grid',
                            placeItems: 'center',
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            border: '2px solid',
                            borderColor: level.status === 'locked' ? 'divider' : 'warning.main',
                            bgcolor: level.status === 'locked' ? 'background.paper' : 'warning.main',
                            color: level.status === 'locked' ? 'text.secondary' : 'warning.contrastText'
                          }}>
                          
                            <RewardIcon type={level.reward.type} />
                          </Paper>
                        </Tooltip>
                      }
                    </Stack>
                  </Box>);

              })}
            </Box>);

        })}
      </Box>
    </Paper>);

}