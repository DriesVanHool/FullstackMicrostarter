import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { RoleGuard } from './RoleGuard.tsx'

interface RoleRoutesProps {
  roles: readonly string[]
  fallback?: ReactNode
}

export function RoleRoutes({ roles, fallback = null }: RoleRoutesProps) {
  return (
    <RoleGuard roles={roles} fallback={fallback}>
      <Outlet />
    </RoleGuard>
  )
}
