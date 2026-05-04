import AppsIcon from '@mui/icons-material/Apps'
import DashboardIcon from '@mui/icons-material/Dashboard'
import GroupIcon from '@mui/icons-material/Group'
import SettingsIcon from '@mui/icons-material/Settings'
import { Route, Routes } from 'react-router-dom'
import { ProtectedRoutes, PublicRoutes } from '@fullstackmicrostarter/auth'
import type { NavigationItem, RoleMenuItem } from '@fullstackmicrostarter/layout'
import { WorkspaceLayout } from '@fullstackmicrostarter/layout'
import { AppLoadingScreen } from '@fullstackmicrostarter/ui'
import WorkspaceDashboardPage from '../components/WorkspaceDashboardPage.tsx'
import WorkspaceLoginPage from '../components/WorkspaceLoginPage.tsx'
import SectionPlaceholderPage from '../components/SectionPlaceholderPage.tsx'
import { portalUrl } from '../config/env.ts'

const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', description: 'Overview and recent workspace activity', path: '/', icon: <DashboardIcon /> },
  { label: 'Users', description: 'People, roles, and access', path: '/users', icon: <GroupIcon /> },
  { label: 'Settings', description: 'Configuration and preferences', path: '/settings', icon: <SettingsIcon /> },
]

const profileMenuItems: RoleMenuItem[] = [
  { label: 'Back to Portal', href: portalUrl, icon: <AppsIcon fontSize="small" /> },
]

export default function WorkspaceRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoutes loadingElement={<AppLoadingScreen />} />}>
        <Route path="/login" element={<WorkspaceLoginPage />} />
      </Route>

      <Route element={<ProtectedRoutes loadingElement={<AppLoadingScreen />} />}>
        <Route
          element={
            <WorkspaceLayout
              appName="Workspace"
              appSubtitle="Focused product workspace"
              navigationItems={navigationItems}
              profileMenuItems={profileMenuItems}
            />
          }
        >
          <Route path="/" element={<WorkspaceDashboardPage />} />
          <Route path="/modules" element={<SectionPlaceholderPage title="Modules" description="Module-specific routes stay in the workspace app while the shared navigation and shell come from shared workspace packages." />} />
          <Route path="/users" element={<SectionPlaceholderPage title="Users" description="User, role, and access workflows remain workspace-specific and can grow here without affecting the portal shell." />} />
          <Route path="/settings" element={<SectionPlaceholderPage title="Settings" description="Workspace settings stay local to this app even though layout and sign-in components are shared." />} />
        </Route>
      </Route>
    </Routes>
  )
}
