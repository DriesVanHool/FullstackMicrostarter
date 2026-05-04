import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import {Apps} from '@mui/icons-material'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthRole, ProtectedRoutes, PublicRoutes, RoleRoutes } from '@fullstackmicrostarter/auth'
import type { NavigationItem, RoleMenuItem } from '@fullstackmicrostarter/layout'
import { PortalLayout } from '@fullstackmicrostarter/layout'
import { AppLoadingScreen } from '@fullstackmicrostarter/ui'
import PortalLandingPage from '../components/PortalLandingPage.tsx'
import PortalLoginPage from '../components/PortalLoginPage.tsx'
import AdminLandingPage from '../components/admin/AdminLandingPage.tsx'
import AdminUsersPage from '../components/admin/AdminUsersPage.tsx'
import { workspaceUrl } from '../config/env.ts'

const navigationItems: NavigationItem[] = [
  {
    label: 'Portal home',
    description: 'Browse and launch the applications available to your account.',
    path: '/',
    icon: <Apps />,
  },
  {
    label: 'Admin',
    description: 'Portal administration and configuration management.',
    path: '/admin',
    icon: <AdminPanelSettingsIcon />,
    requiredRoles: [AuthRole.ADMIN],
  },
]

const profileMenuItems: RoleMenuItem[] = [
  {
    label: 'Admin console',
    path: '/admin',
    icon: <ManageAccountsIcon fontSize="small" />,
    requiredRoles: [AuthRole.ADMIN],
  },
]

export default function PortalRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoutes loadingElement={<AppLoadingScreen />} />}>
        <Route path="/login" element={<PortalLoginPage />} />
      </Route>

      <Route element={<ProtectedRoutes loadingElement={<AppLoadingScreen />} />}>
        <Route
          element={
            <PortalLayout
              appName="Fullstack Microstarter"
              appSubtitle="Hosted application launcher"
              navigationItems={navigationItems}
              profileMenuItems={profileMenuItems}
            />
          }
        >
          <Route path="/" element={<PortalLandingPage />} />
          <Route element={<RoleRoutes roles={[AuthRole.ADMIN]} fallback={<Navigate to="/" replace />} />}>
            <Route path="/admin" element={<AdminLandingPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
