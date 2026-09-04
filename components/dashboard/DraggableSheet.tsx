import React, { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { Box, ButtonBase, Container, Paper, Stack, Typography } from '@mui/material';
import { motion, PanInfo, useDragControls, useReducedMotion } from 'framer-motion';

interface DraggableSheetProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  /** Headline shown while the sheet is collapsed. */
  collapsedTitle: string;
  /** Headline shown while the sheet is open. */
  expandedTitle: string;
  collapsedLabel: string;
  expandedLabel: string;
  /** Optional shortcut rendered in the collapsed bar. */
  collapsedAction?: React.ReactNode;
  children: React.ReactNode;
}

const PEEK_HEIGHT = 80;
const DEFAULT_COLLAPSED_OFFSET = 320;

function triggerHaptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(12);
  }
}

export function DraggableSheet({
  expanded,
  onExpandedChange,
  collapsedTitle,
  expandedTitle,
  collapsedLabel,
  expandedLabel,
  collapsedAction,
  children
}: DraggableSheetProps) {
  const reduceMotion = useReducedMotion();
  const dragControls = useDragControls();
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const ignoreTapRef = useRef(false);
  const [collapsedOffset, setCollapsedOffset] = useState(DEFAULT_COLLAPSED_OFFSET);

  useEffect(() => {
    const element = sheetRef.current;
    if (!element) return;

    const updateOffset = () => setCollapsedOffset(Math.max(0, element.getBoundingClientRect().height - PEEK_HEIGHT));
    updateOffset();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateOffset);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const commitSnap = (nextExpanded: boolean) => {
    onExpandedChange(nextExpanded);
    triggerHaptic();
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    dragControls.start(event);
  };

  const handleDragStart = () => {
    ignoreTapRef.current = true;
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const openThreshold = Math.max(42, collapsedOffset * 0.16);
    const closeThreshold = Math.max(56, collapsedOffset * 0.2);
    const nextExpanded = expanded ?
    !(info.velocity.y > 460 || info.offset.y > closeThreshold) :
    info.velocity.y < -460 || info.offset.y < -openThreshold;

    commitSnap(nextExpanded);
    window.setTimeout(() => {
      ignoreTapRef.current = false;
    }, 0);
  };

  const handleBarClick = () => {
    if (ignoreTapRef.current) return;
    commitSnap(!expanded);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: 20,
        left: 0,
        right: 0,
        bottom: 0,
        height: { xs: '46dvh', sm: '44dvh', md: '42dvh' },
        minHeight: 300,
        maxHeight: 520,
        pointerEvents: 'none'
      }}>
      
      <motion.div
        ref={sheetRef}
        drag="y"
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: collapsedOffset }}
        dragElastic={0.035}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        initial={false}
        animate={{ y: expanded ? 0 : collapsedOffset }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 430, damping: 40, mass: 0.75 }}
        style={{ height: '100%', pointerEvents: 'auto', touchAction: 'pan-x' }}>
        
        <Paper
          elevation={8}
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            maxWidth: 1280,
            mx: 'auto',
            overflow: 'hidden',
            borderRadius: '24px 24px 0 0',
            border: '1px solid',
            borderBottom: 0,
            borderColor: 'divider'
          }}>
          
          <Box
            component="header"
            sx={{ position: 'relative', height: PEEK_HEIGHT, borderBottom: expanded ? '1px solid' : 0, borderColor: 'divider' }}>
            
            <ButtonBase
              aria-expanded={expanded}
              aria-label={expanded ? expandedLabel : collapsedLabel}
              onPointerDown={handlePointerDown}
              onClick={handleBarClick}
              sx={{ position: 'absolute', inset: 0, width: '100%', minHeight: 48, cursor: 'grab', '&:active': { cursor: 'grabbing' } }} />
            

            <Box
              aria-hidden="true"
              sx={{ position: 'absolute', top: 7, left: '50%', width: 44, height: 5, borderRadius: 10, bgcolor: 'divider', transform: 'translateX(-50%)' }} />
            

            <Stack
              direction="row"
              alignItems="center"
              spacing={{ xs: 1, sm: 1.5 }}
              sx={{ position: 'relative', height: '100%', px: { xs: 2, sm: 3 }, pt: 1, pointerEvents: 'none' }}>
              
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body1" noWrap sx={{ fontWeight: 800 }}>
                  {expanded ? expandedTitle : collapsedTitle}
                </Typography>
                {expanded &&
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                    Geser ke bawah untuk melipat panel
                  </Typography>
                }
              </Box>

              {!expanded && collapsedAction &&
              <Box
                onPointerDown={(event) => event.stopPropagation()}
                sx={{ pointerEvents: 'auto', flexShrink: 0, display: 'flex' }}>
                
                  {collapsedAction}
                </Box>
              }

              <Box sx={{ width: 40, height: 40, display: 'grid', placeItems: 'center', color: 'primary.main', flexShrink: 0 }}>
                {expanded ? <KeyboardArrowDownRoundedIcon /> : <KeyboardArrowUpRoundedIcon />}
              </Box>
            </Stack>
          </Box>

          <Box
            aria-hidden={!expanded}
            sx={{
              height: `calc(100% - ${PEEK_HEIGHT}px)`,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              visibility: expanded ? 'visible' : 'hidden'
            }}>
            
            <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 }, py: { xs: 2.5, md: 3 } }}>
              {children}
            </Container>
          </Box>
        </Paper>
      </motion.div>
    </Box>);

}