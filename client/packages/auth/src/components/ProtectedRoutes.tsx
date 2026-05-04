import type { PropsWithChildren, ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider.tsx'

interface RouteGuardProps extends PropsWithChildren {
  loadingElement?: ReactNode
}

export function ProtectedRoutes({ children, loadingElement }: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <>{loadingElement ?? null}</>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children ? <>{children}</> : <Outlet />
}
