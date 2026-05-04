import type { PropsWithChildren, ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider.tsx'

interface RouteGuardProps extends PropsWithChildren {
  loadingElement?: ReactNode
}

export function PublicRoutes({ children, loadingElement }: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <>{loadingElement ?? null}</>
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
