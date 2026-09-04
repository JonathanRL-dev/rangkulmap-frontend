import React from 'react';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion, useReducedMotion } from 'framer-motion';

export function RippleSearch() {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();

  return (
    <Stack alignItems="center" spacing={3} role="status" aria-live="polite" sx={{ py: { xs: 4, sm: 6 } }}>
      <Box sx={{ position: 'relative', width: 260, height: 260, display: 'grid', placeItems: 'center' }}>
        {[0, 0.8, 1.6].map((delay, index) =>
        <Box
          key={delay}
          component={motion.div}
          aria-hidden="true"
          initial={false}
          animate={
          reduceMotion ?
          { scale: 1 + index * 0.35, opacity: 0.26 - index * 0.05 } :
          { scale: [0.55, 2.2], opacity: [0.58, 0] }
          }
          transition={
          reduceMotion ?
          { duration: 0 } :
          { duration: 2.4, repeat: Infinity, delay, ease: [0.22, 1, 0.36, 1] }
          }
          sx={{
            position: 'absolute',
            width: 108,
            height: 108,
            borderRadius: '50%',
            border: '3px solid',
            borderColor: 'primary.main',
            bgcolor: alpha(theme.palette.primary.main, 0.05)
          }} />

        )}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            width: 82,
            height: 82,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            border: '5px solid',
            borderColor: 'background.paper',
            boxShadow: '0 8px 22px rgba(0,0,0,.2)'
          }}>
          
          <MyLocationRoundedIcon sx={{ fontSize: 38 }} />
        </Box>
      </Box>
      {reduceMotion && <CircularProgress size={28} thickness={5} aria-label="Pencarian berlangsung" />}
      <Box sx={{ textAlign: 'center' }}>
        <Typography component="h2" variant="h2">
          Mencari relawan dalam radius 500m...
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Kami memprioritaskan relawan aktif dengan Trust Score terbaik.
        </Typography>
      </Box>
    </Stack>);

}