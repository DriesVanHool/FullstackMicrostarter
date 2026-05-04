import { useApiClient, type PageResponse } from '@fullstackmicrostarter/api-client'
import { apiBaseUrl } from '../config/env.ts'
import type { IUserRequest } from '../models/IUserRequest.ts'
import type { IUserResponse } from '../models/IUserResponse.ts'

export function useUserAdminService() {
  const apiClient = useApiClient()

  return {
    getUsersPage(page: number, size: number, search?: string, sortBy?: string, orderBy?: 'asc' | 'desc') {
      return apiClient.get<PageResponse<IUserResponse>>(`${apiBaseUrl}/admin/users`, {
        page,
        size,
        search: search?.trim() ? search.trim() : undefined,
        sortBy: sortBy?.trim() ? sortBy.trim() : undefined,
        orderBy,
      })
    },
    getUserById(id: string) {
      return apiClient.get<IUserResponse>(`${apiBaseUrl}/users/${id}`)
    },
    createUser(request: IUserRequest) {
      return apiClient.post<IUserResponse>(`${apiBaseUrl}/admin/users`, request)
    },
    updateUser(id: string, request: IUserRequest) {
      return apiClient.put<IUserResponse>(`${apiBaseUrl}/admin/users/${id}`, request)
    },
    deleteUser(id: string) {
      return apiClient.delete<void>(`${apiBaseUrl}/users/${id}`)
    },
  }
}
