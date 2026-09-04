import { createTheme, Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    sos: Palette['primary'];
  }
  interface PaletteOptions {
    sos?: PaletteOptions['primary'];
  }
}

export type AppColorMode = 'light' | 'dark';

/**
 * RangkulMap theme.
 * True dark mode uses a pure black canvas with dedicated card surfaces rather than
 * an inverted light palette. Emergency red remains isolated in palette.sos so it
 * can never be confused with ordinary palette.error feedback.
 */
export function createAppTheme(mode: AppColorMode, highContrast: boolean, fontScale = 1): Theme {
  const isDark = mode === 'dark';
  const primary = isDark ? '#1A8CFF' : '#0F4C81';
  const error = isDark ? '#FB923C' : '#C2410C';
  const success = isDark ? '#4CAF50' : '#2E7D32';
  const warning = isDark ? '#FFD54F' : '#FFA000';
  const sos = isDark ? '#FF5252' : '#D32F2F';
  const background = isDark ? '#000000' : '#F8F9FA';
  const surface = isDark ? '#1E1E1E' : '#FFFFFF';

  const rem = (px: number) => `${px * fontScale / 16}rem`;

  return createTheme({
    palette: {
      mode,
      primary: { main: primary, contrastText: isDark ? '#000000' : '#FFFFFF' },
      error: { main: error, contrastText: isDark ? '#000000' : '#FFFFFF' },
      success: { main: success, contrastText: isDark ? '#000000' : '#FFFFFF' },
      warning: { main: warning, contrastText: '#000000' },
      background: { default: background, paper: surface },
      // Emergency actions must always use this token, never palette.error.
      sos: { main: sos, contrastText: '#FFFFFF' },
      text: {
        primary: isDark ? '#FFFFFF' : '#101820',
        secondary: isDark ? highContrast ? '#FFFFFF' : '#D5D9DE' : highContrast ? '#101820' : '#45515E'
      },
      divider: highContrast ? isDark ? '#FFFFFF' : '#101820' : isDark ? '#505050' : '#D7DCE1'
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
      h1: { fontSize: rem(32), fontWeight: 700, lineHeight: 1.2 },
      h2: { fontSize: rem(24), fontWeight: 600, lineHeight: 1.3 },
      h3: { fontSize: rem(20), fontWeight: 600, lineHeight: 1.3 },
      body1: { fontSize: rem(16), fontWeight: 400, lineHeight: 1.5 },
      body2: { fontSize: rem(15), fontWeight: 400, lineHeight: 1.5 },
      caption: { fontSize: rem(14), fontWeight: 500, lineHeight: 1.4 },
      button: { fontSize: rem(16), fontWeight: 700, textTransform: 'none' }
    },
    shape: { borderRadius: 16 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: background },
          '*': { boxSizing: 'border-box' }
        }
      },
      MuiButtonBase: {
        defaultProps: { disableRipple: false },
        styleOverrides: {
          root: {
            '&.Mui-focusVisible': {
              outline: `3px solid ${primary}`,
              outlineOffset: 3
            }
          }
        }
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { minHeight: 48, borderRadius: 12, fontWeight: 700 },
          sizeLarge: { minHeight: 56 }
        }
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined' }
      },
      MuiOutlinedInput: {
        styleOverrides: { root: { borderRadius: 12 } }
      },
      MuiDialog: {
        defaultProps: { fullWidth: true },
        styleOverrides: { paper: { borderRadius: 20 } }
      },
      MuiSnackbar: {
        defaultProps: { anchorOrigin: { vertical: 'top', horizontal: 'center' } }
      },
      MuiAlert: {
        styleOverrides: { root: { borderRadius: 12, alignItems: 'center' } }
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 10, fontWeight: 600 } }
      },
      MuiStepper: {
        styleOverrides: { root: { padding: 0 } }
      },
      MuiDrawer: {
        styleOverrides: { paper: { backgroundImage: 'none' } }
      },
      MuiAvatar: {
        styleOverrides: { root: { fontWeight: 700 } }
      },
      MuiBadge: {
        styleOverrides: { badge: { fontWeight: 700 } }
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { height: 8, borderRadius: 999 },
          bar: { borderRadius: 999 }
        }
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } }
      }
    }
  });
}