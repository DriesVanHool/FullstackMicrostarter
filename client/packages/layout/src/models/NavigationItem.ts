import type { ReactNode } from 'react'

interface BaseNavigationItem {
  label: string
  description: string
  icon?: ReactNode
  requiredRoles?: readonly string[]
}

interface RouteNavigationItem extends BaseNavigationItem {
  path: string
}

interface ExternalNavigationItem extends BaseNavigationItem {
  href: string
}

export type NavigationItem = RouteNavigationItem | ExternalNavigationItem
