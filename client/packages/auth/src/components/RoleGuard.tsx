import type { PropsWithChildren, ReactNode } from 'react'
import { useAuth } from '../providers/AuthProvider.tsx'
import { hasAnyRole } from '../utils/roles.ts'

interface RoleGuardProps extends PropsWithChildren {
  roles: readonly string[]
  fallback?: ReactNode
}

export function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  const { user } = useAuth()

  if (!hasAnyRole(user, roles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
