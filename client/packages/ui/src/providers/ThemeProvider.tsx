/* eslint-disable react-refresh/only-export-components */
import type { PropsWithChildren } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material'
import { darkTheme, lightTheme } from '../themes/theme.ts'

export type ThemeMode = 'light' | 'dark'

const THEME_COOKIE_NAME = 'fullstackmicrostarter-theme-mode'

interface ThemeModeContextValue {
  mode: ThemeMode
  toggleMode: () => void
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined)

const isThemeMode = (value: string | null | undefined): value is ThemeMode => value === 'light' || value === 'dark'

const getCookieDomain = () => {
  const cookieDomain = import.meta.env.VITE_COOKIE_DOMAIN
  return cookieDomain?.trim() ? cookieDomain.trim() : undefined
}

const getStoredMode = (): ThemeMode | null => {
  if (typeof document === 'undefined') {
    return null
  }

  const cookieValue = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${THEME_COOKIE_NAME}=`))
    ?.split('=')[1]

  return isThemeMode(cookieValue) ? cookieValue : null
}

const persistMode = (mode: ThemeMode) => {
  if (typeof document === 'undefined') {
    return
  }

  const domain = getCookieDomain()
  const domainAttribute = domain ? `; Domain=${domain}` : ''

  document.cookie = `${THEME_COOKIE_NAME}=${mode}; Path=/${domainAttribute}; Max-Age=31536000; SameSite=Lax`
}

const getPreferredMode = (): ThemeMode => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const getInitialMode = (): ThemeMode => getStoredMode() ?? getPreferredMode()

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode)

  useEffect(() => {
    persistMode(mode)
  }, [mode])

  const contextValue = useMemo(
    () => ({
      mode,
      toggleMode: () => setMode((currentMode) => (currentMode === 'light' ? 'dark' : 'light')),
    }),
    [mode],
  )

  const theme = mode === 'dark' ? darkTheme : lightTheme

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  )
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext)

  if (!context) {
    throw new Error('useThemeMode must be used within AppThemeProvider')
  }

  return context
}
