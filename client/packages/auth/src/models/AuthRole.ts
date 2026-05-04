export const AuthRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const

export type AuthRole = (typeof AuthRole)[keyof typeof AuthRole]

export const ALL_AUTH_ROLES: AuthRole[] = Object.values(AuthRole)
