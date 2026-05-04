import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@fullstackmicrostarter/auth'
import { AppThemeProvider } from '@fullstackmicrostarter/ui'
import App from './App.tsx'
import { authConfig } from './config/env.ts'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppThemeProvider>
        <AuthProvider config={authConfig}>
          <App />
        </AuthProvider>
      </AppThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
