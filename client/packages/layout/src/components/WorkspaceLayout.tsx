import { Box, useMediaQuery, useTheme } from '@mui/material'
import { useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthorizedItems } from '@fullstackmicrostarter/auth'
import { SideBar, collapsedDrawerWidth, drawerWidth } from './SideBar.tsx'
import { TopBar } from './TopBar.tsx'
import type { NavigationItem } from '../models/NavigationItem.ts'
import type { RoleMenuItem } from '../models/RoleMenuItem.ts'

interface WorkspaceLayoutProps {
  appName: string
  appSubtitle: string
  navigationItems: NavigationItem[]
  profileMenuItems?: RoleMenuItem[]
}

export function WorkspaceLayout({ appName, appSubtitle, navigationItems, profileMenuItems = [] }: WorkspaceLayoutProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigationItemsForUser = useAuthorizedItems(navigationItems)
  const profileMenuItemsForUser = useAuthorizedItems(profileMenuItems)

  const desktopDrawerWidth = useMemo(() => (collapsed ? collapsedDrawerWidth : drawerWidth), [collapsed])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <SideBar
        appName={appName}
        appSubtitle={appSubtitle}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        isMobile={isMobile}
        onToggleCollapsed={() => setCollapsed((value) => !value)}
        onToggleMobile={() => setMobileOpen((value) => !value)}
        onCloseMobile={() => setMobileOpen(false)}
        navigationItems={navigationItemsForUser}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { xs: '100%', md: `calc(100% - ${desktopDrawerWidth}px)` },
          transition: theme.transitions.create(['width'], {
            duration: theme.transitions.duration.enteringScreen,
            easing: theme.transitions.easing.easeInOut,
          }),
        }}
      >
        <TopBar
          appName={appName}
          appSubtitle={appSubtitle}
          navigationItems={navigationItemsForUser}
          profileMenuItems={profileMenuItemsForUser}
          showSidebarToggle={isMobile}
          onToggleSidebar={() => setMobileOpen((value) => !value)}
          sidebarOpen={mobileOpen}
        />
        <Box
          sx={{
            px: { xs: 2, md: 4 },
            py: { xs: 2, md: 3 },
            transition: theme.transitions.create(['padding'], {
              duration: theme.transitions.duration.enteringScreen,
              easing: theme.transitions.easing.easeInOut,
            }),
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
