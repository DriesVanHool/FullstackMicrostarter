import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { resolveAccessToken } from '@fullstackmicrostarter/auth'
import { ApiError } from '../models/ApiError.ts'
import { ApiClientContext } from './ApiClientContext.ts'

export function ApiClientProvider({ children }: PropsWithChildren) {
  const queryClient = useMemo(() => new QueryClient(), [])

  const apiClient = useMemo(() => {
    const instance = axios.create()

    instance.interceptors.request.use(async (config) => {
      const token = await resolveAccessToken()
      config.headers.Accept = 'application/json'

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    })

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = error.response?.data?.message ?? `Request failed with status ${error.response?.status ?? 500}`
        return Promise.reject(new ApiError(message, error.response?.status ?? 500))
      },
    )

    return {
      async get<T>(url: string, params?: Record<string, unknown>) {
        const response = await instance.get<T>(url, { params })
        return response.data
      },
      async post<T>(url: string, body?: unknown) {
        const response = await instance.post<T>(url, body)
        return response.data
      },
      async put<T>(url: string, body?: unknown) {
        const response = await instance.put<T>(url, body)
        return response.data
      },
      async patch<T>(url: string, body?: unknown) {
        const response = await instance.patch<T>(url, body)
        return response.data
      },
      async delete<T>(url: string) {
        const response = await instance.delete<T>(url)
        return response.data
      },
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ApiClientContext.Provider value={apiClient}>{children}</ApiClientContext.Provider>
    </QueryClientProvider>
  )
}
