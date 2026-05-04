import type { AuthUser } from '../models/AuthUser.ts'
import { ALL_AUTH_ROLES, type AuthRole } from '../models/AuthRole.ts'

export const normalizeRole = (role: string) => role.trim().toUpperCase()

export const isAuthRole = (role: string): role is AuthRole => ALL_AUTH_ROLES.includes(normalizeRole(role) as AuthRole)

export const hasRole = (user: AuthUser | undefined, role: string) => {
  if (!user) {
    return false
  }

  return user.roles.map(normalizeRole).includes(normalizeRole(role))
}

export const hasAnyRole = (user: AuthUser | undefined, roles?: readonly string[]) => {
  if (!roles || roles.length === 0) {
    return true
  }

  return roles.some((role) => hasRole(user, role))
}
