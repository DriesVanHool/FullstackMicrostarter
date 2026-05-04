import { useMemo } from 'react'
import { useAuth } from '../providers/AuthProvider.tsx'
import { hasAnyRole } from '../utils/roles.ts'

interface RoleAwareItem {
  requiredRoles?: readonly string[]
}

export function useAuthorizedItems<T extends RoleAwareItem>(items: readonly T[]) {
  const { user } = useAuth()

  return useMemo(() => items.filter((item) => hasAnyRole(user, item.requiredRoles)), [items, user])
}
