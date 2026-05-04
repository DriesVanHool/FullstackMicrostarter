import type { AuthConfig } from '@fullstackmicrostarter/auth'

const requiredEnv = (value: string | undefined, key: string) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

export const authConfig: AuthConfig = {
  url: requiredEnv(import.meta.env.VITE_KEYCLOAK_URL, 'VITE_KEYCLOAK_URL'),
  realm: requiredEnv(import.meta.env.VITE_KEYCLOAK_REALM, 'VITE_KEYCLOAK_REALM'),
  clientId: requiredEnv(import.meta.env.VITE_KEYCLOAK_CLIENT_ID, 'VITE_KEYCLOAK_CLIENT_ID'),
}

export const apiBaseUrl = requiredEnv(import.meta.env.VITE_API_BASE_URL, 'VITE_API_BASE_URL')
export const portalUrl = requiredEnv(import.meta.env.VITE_PORTAL_URL, 'VITE_PORTAL_URL')
