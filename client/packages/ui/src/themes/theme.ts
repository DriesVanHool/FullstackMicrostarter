import { alpha, createTheme } from '@mui/material/styles'

const sharedTheme = {
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: ['Inter', 'system-ui', 'sans-serif'].join(','),
    h1: {
      fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    button: {
      textTransform: 'none' as const,
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
  },
}

const createAppTheme = (mode: 'light' | 'dark') => {
  const palette = mode === 'light'
    ? {
        mode,
        primary: {
          main: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb',
        },
        secondary: {
          main: '#0f766e',
          light: '#14b8a6',
          dark: '#115e59',
        },
        text: {
          primary: '#0f172a',
          secondary: '#475569',
        },
        divider: '#dbe4ef',
        background: {
          default: '#f6f8fb',
          paper: '#ffffff',
        },
      }
    : {
        mode,
        primary: {
          main: '#7cb4ff',
          light: '#a8ccff',
          dark: '#4f8ff0',
        },
        secondary: {
          main: '#3dc6bb',
          light: '#6adbd2',
          dark: '#249b94',
        },
        text: {
          primary: '#f4f7fb',
          secondary: '#9fb0c7',
        },
        divider: '#223044',
        background: {
          default: '#0d1726',
          paper: '#121f31',
        },
      }

  return createTheme({
    ...sharedTheme,
    palette,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: mode === 'dark'
              ? 'linear-gradient(180deg, #0d1726 0%, #101b2c 100%)'
              : 'linear-gradient(180deg, #f6f8fb 0%, #eef3f9 100%)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.82 : 0.9)}`,
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 16,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 18px 38px rgba(3, 8, 18, 0.28)'
              : '0 18px 38px rgba(15, 23, 42, 0.06)',
          }),
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            minHeight: 40,
            borderRadius: 10,
            paddingInline: 16,
          },
          sizeLarge: {
            minHeight: 46,
            paddingInline: 20,
          },
          contained: ({ theme }) => ({
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
              backgroundColor: theme.palette.primary.dark,
            },
          }),
          outlined: ({ theme }) => ({
            borderColor: alpha(theme.palette.divider, 0.95),
          }),
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            height: 30,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: ({ theme }) => ({
            marginTop: theme.spacing(1),
            borderRadius: 14,
            border: `1px solid ${alpha(theme.palette.divider, 0.95)}`,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 18px 32px rgba(3, 8, 18, 0.32)'
              : '0 16px 28px rgba(15, 23, 42, 0.1)',
          }),
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 8,
            '&.Mui-selected': {
              backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.1),
              color: theme.palette.text.primary,
            },
            '&.Mui-selected:hover': {
              backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.24 : 0.14),
            },
          }),
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: ({ theme }) => ({
            '&.Mui-checked': {
              color: theme.palette.primary.light,
            },
            '&.Mui-checked + .MuiSwitch-track': {
              backgroundColor: alpha(theme.palette.primary.main, 0.55),
            },
          }),
          track: ({ theme }) => ({
            borderRadius: 999,
            backgroundColor: alpha(theme.palette.text.secondary, 0.35),
          }),
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderColor: alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.78 : 0.92),
          }),
        },
      },
    },
  })
}

export const lightTheme = createAppTheme('light')
export const darkTheme = createAppTheme('dark')

