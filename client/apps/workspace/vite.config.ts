import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@fullstackmicrostarter/api-client': fileURLToPath(new URL('../../packages/api-client/src/index.ts', import.meta.url)),
      '@fullstackmicrostarter/auth': fileURLToPath(new URL('../../packages/auth/src/index.ts', import.meta.url)),
      '@fullstackmicrostarter/layout': fileURLToPath(new URL('../../packages/layout/src/index.ts', import.meta.url)),
      '@fullstackmicrostarter/ui': fileURLToPath(new URL('../../packages/ui/src/index.ts', import.meta.url)),
    },
  },
  server: {
    port: 5174,
  },
})
