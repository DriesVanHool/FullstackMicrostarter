import LogoutIcon from '@mui/icons-material/Logout'
import { DarkMode, LightMode, Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material'
import {
  alpha,
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@fullstackmicrostarter/auth'
import { useThemeMode } from '@fullstackmicrostarter/ui'
import type { NavigationItem } from '../models/NavigationItem.ts'
import type { RoleMenuItem } from '../models/RoleMenuItem.ts'

interface TopBarProps {
  appName: string
  appSubtitle: string
  navigationItems: NavigationItem[]
  profileMenuItems?: RoleMenuItem[]
  showSidebarToggle?: boolean
  onToggleSidebar?: () => void
  sidebarOpen?: boolean
}

const isCurrentPath = (currentPath: string, itemPath: string) => {
  if (itemPath === '/') {
    return currentPath === '/'
  }

  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`)
}

const getInitials = (fullName?: string) => {
  if (!fullName) {
    return 'QA'
  }

  const parts = fullName.split(' ').filter(Boolean)
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'QA'
}

const isInternalProfileMenuItem = (item: RoleMenuItem): item is Extract<RoleMenuItem, { path: string }> => 'path' in item

export function TopBar({
  appName,
  appSubtitle,
  navigationItems,
  profileMenuItems = [],
  showSidebarToggle = false,
  onToggleSidebar,
  sidebarOpen = false,
}: TopBarProps) {
  const theme = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const { mode, toggleMode } = useThemeMode()
  const { logout, user } = useAuth()
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null)

  const currentItem = useMemo(
    () => navigationItems.find((item) => 'path' in item && isCurrentPath(location.pathname, item.path)) ?? navigationItems.find((item) => 'path' in item),
    [location.pathname, navigationItems],
  )

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        backdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.58)}`,
        backgroundColor: alpha(theme.palette.background.default, theme.palette.mode === 'dark' ? 0.88 : 0.82),
      }}
    >
      <Toolbar sx={{ minHeight: '72px !important', px: { xs: 2, md: 4 }, justifyContent: 'space-between', gap: 2.5 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
          {showSidebarToggle ? (
            <IconButton onClick={onToggleSidebar} edge="start">
              {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          ) : null}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {currentItem?.label ?? appName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentItem?.description ?? appSubtitle}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <IconButton onClick={toggleMode}>
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
          <IconButton onClick={(event) => setMenuAnchorEl(event.currentTarget)} sx={{ p: 0 }}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.16),
                color: theme.palette.primary.main,
                width: 40,
                height: 40,
                fontWeight: 700,
              }}
            >
              {getInitials(user?.fullName)}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={() => setMenuAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ px: 2, py: 1.5, minWidth: 220 }}>
              <Typography variant="subtitle2">{user?.fullName ?? 'Workspace user'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email ?? user?.username}
              </Typography>
            </Box>
            {profileMenuItems.length > 0 ? <Divider /> : null}
            {profileMenuItems.map((item) => {
              const key = isInternalProfileMenuItem(item) ? item.path : item.href

              return (
                <MenuItem
                  key={key}
                  onClick={() => {
                    setMenuAnchorEl(null)

                    if (isInternalProfileMenuItem(item)) {
                      navigate(item.path)
                    } else {
                      window.location.assign(item.href)
                    }
                  }}
                >
                  {item.icon ? <ListItemIcon>{item.icon}</ListItemIcon> : null}
                  {item.label}
                </MenuItem>
              )
            })}
            <Divider />
            <MenuItem
              onClick={() => {
                setMenuAnchorEl(null)
                void logout()
              }}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
