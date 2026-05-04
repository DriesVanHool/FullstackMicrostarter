/* eslint-disable react-refresh/only-export-components */
import type { PropsWithChildren } from 'react'
import { createContext, startTransition, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { KeycloakTokenParsed } from 'keycloak-js'
import Keycloak from 'keycloak-js'
import { setAccessTokenResolver } from '../config/tokenProvider.ts'
import type { AuthConfig } from '../models/AuthConfig.ts'
import type { AuthUser } from '../models/AuthUser.ts'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  user?: AuthUser
  login: () => Promise<void>
  logout: () => Promise<void>
  getAccessToken: () => Promise<string | undefined>
}

type KeycloakClaims = KeycloakTokenParsed & {
  preferred_username?: string
  given_name?: string
  family_name?: string
  email?: string
  realm_access?: {
    roles?: string[]
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const getRedirectUri = () => window.location.href

const getUserFromClaims = (claims: KeycloakClaims | undefined): AuthUser | undefined => {
  if (!claims?.sub) {
    return undefined
  }

  const firstName = claims.given_name
  const lastName = claims.family_name
  const username = claims.preferred_username ?? claims.email ?? claims.sub
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || username

  return {
    id: claims.sub,
    username,
    email: claims.email,
    firstName,
    lastName,
    fullName,
    roles: claims.realm_access?.roles ?? [],
  }
}

export function AuthProvider({ children, config }: PropsWithChildren<{ config: AuthConfig }>) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<AuthUser>()
  const keycloakRef = useRef<Keycloak | null>(null)
  const initPromiseRef = useRef<Promise<boolean> | null>(null)

  if (!keycloakRef.current) {
    keycloakRef.current = new Keycloak(config)
  }

  const keycloak = keycloakRef.current

  useEffect(() => {
    let cancelled = false

    const syncUser = async () => {
      if (!keycloak.authenticated) {
        startTransition(() => {
          setIsAuthenticated(false)
          setUser(undefined)
        })
        return
      }

      const claims = keycloak.tokenParsed as KeycloakClaims | undefined

      if (!cancelled) {
        startTransition(() => {
          setIsAuthenticated(true)
          setUser(getUserFromClaims(claims))
        })
      }
    }

    const initializeKeycloak = () => {
      if (!initPromiseRef.current) {
        initPromiseRef.current = keycloak
          .init({
            onLoad: 'check-sso',
            pkceMethod: 'S256',
            checkLoginIframe: false,
            redirectUri: getRedirectUri(),
          })
          .catch((error) => {
            initPromiseRef.current = null
            return Promise.reject(error)
          })
      }

      return initPromiseRef.current
    }

    const initializeAuth = async () => {
      try {
        const authenticated = await initializeKeycloak()

        if (cancelled) {
          return
        }

        if (!authenticated) {
          startTransition(() => {
            setIsAuthenticated(false)
            setUser(undefined)
          })
          return
        }

        await syncUser()
      } finally {
        if (!cancelled) {
          startTransition(() => setIsLoading(false))
        }
      }
    }

    keycloak.onAuthSuccess = () => {
      void syncUser()
    }

    keycloak.onAuthLogout = () => {
      if (!cancelled) {
        startTransition(() => {
          setIsAuthenticated(false)
          setUser(undefined)
        })
      }
    }

    keycloak.onTokenExpired = () => {
      void keycloak.updateToken(30).catch(() => keycloak.clearToken())
    }

    void initializeAuth()

    return () => {
      cancelled = true
      keycloak.onAuthSuccess = undefined
      keycloak.onAuthLogout = undefined
      keycloak.onTokenExpired = undefined
    }
  }, [keycloak])

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      login: async () => {
        await keycloak.login({ redirectUri: getRedirectUri() })
      },
      logout: async () => {
        await keycloak.logout({ redirectUri: getRedirectUri() })
      },
      getAccessToken: async () => {
        if (!keycloak.authenticated) {
          return undefined
        }

        await keycloak.updateToken(30)
        return keycloak.token
      },
    }),
    [isAuthenticated, isLoading, keycloak, user],
  )

  useEffect(() => {
    if (!isAuthenticated) {
      setAccessTokenResolver(null)
      return
    }

    setAccessTokenResolver(contextValue.getAccessToken)

    return () => {
      setAccessTokenResolver(null)
    }
  }, [contextValue, isAuthenticated])

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
