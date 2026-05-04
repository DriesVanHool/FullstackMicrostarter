import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@fullstackmicrostarter/auth'
import { ApiClientProvider } from '@fullstackmicrostarter/api-client'
import { AppThemeProvider } from '@fullstackmicrostarter/ui'
import { authConfig } from './config/env.ts'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider>
      <BrowserRouter>
        <AuthProvider config={authConfig}>
          <ApiClientProvider>
            <App />
          </ApiClientProvider>
        </AuthProvider>
      </BrowserRouter>
    </AppThemeProvider>
  </StrictMode>,
)
