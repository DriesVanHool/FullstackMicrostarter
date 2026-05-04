import { createContext, useContext } from 'react'

export interface ApiClientContextValue {
  get: <T>(url: string, params?: Record<string, unknown>) => Promise<T>
  post: <T>(url: string, body?: unknown) => Promise<T>
  put: <T>(url: string, body?: unknown) => Promise<T>
  patch: <T>(url: string, body?: unknown) => Promise<T>
  delete: <T>(url: string) => Promise<T>
}

export const ApiClientContext = createContext<ApiClientContextValue | undefined>(undefined)

export function useApiClient() {
  const context = useContext(ApiClientContext)

  if (!context) {
    throw new Error('useApiClient must be used inside ApiClientProvider')
  }

  return context
}
