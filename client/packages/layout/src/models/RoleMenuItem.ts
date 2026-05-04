import type { ReactNode } from 'react'

interface BaseRoleMenuItem {
  label: string
  icon?: ReactNode
  requiredRoles?: readonly string[]
}

interface InternalRoleMenuItem extends BaseRoleMenuItem {
  path: string
}

interface ExternalRoleMenuItem extends BaseRoleMenuItem {
  href: string
}

export type RoleMenuItem = InternalRoleMenuItem | ExternalRoleMenuItem
