import AppsIcon from '@mui/icons-material/Apps'
import CloseIcon from '@mui/icons-material/Close'
import { DarkMode, LightMode } from '@mui/icons-material'
import LogoutIcon from '@mui/icons-material/Logout'
import {
  alpha,
  AppBar,
  Avatar,
  Backdrop,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Divider,
  Fade,
  Grid,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Portal,
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthorizedItems, useAuth } from '@fullstackmicrostarter/auth'
import { useThemeMode } from '@fullstackmicrostarter/ui'
import type { NavigationItem } from '../models/NavigationItem.ts'
import type { RoleMenuItem } from '../models/RoleMenuItem.ts'

interface PortalLayoutProps {
  appName: string
  appSubtitle: string
  navigationItems: NavigationItem[]
  profileMenuItems?: RoleMenuItem[]
}

const getInitials = (fullName?: string) => {
  if (!fullName) {
    return 'QA'
  }

  const parts = fullName.split(' ').filter(Boolean)
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'QA'
}

const isRouteItem = (item: NavigationItem): item is Extract<NavigationItem, { path: string }> => 'path' in item
const isExternalItem = (item: NavigationItem): item is Extract<NavigationItem, { href: string }> => 'href' in item
const isInternalProfileMenuItem = (item: RoleMenuItem): item is Extract<RoleMenuItem, { path: string }> => 'path' in item

export function PortalLayout({ appName, appSubtitle, navigationItems, profileMenuItems = [] }: PortalLayoutProps) {
  const theme = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const { mode, toggleMode } = useThemeMode()
  const { logout, user } = useAuth()
  const [appsOpen, setAppsOpen] = useState(false)
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null)
  const navigationItemsForUser = useAuthorizedItems(navigationItems)
  const profileMenuItemsForUser = useAuthorizedItems(profileMenuItems)

  const currentItem = useMemo(
    () => navigationItemsForUser.find((item) => isRouteItem(item) && (location.pathname === item.path || location.pathname.startsWith(`${item.path}/`))) ?? navigationItemsForUser.find(isRouteItem),
    [location.pathname, navigationItemsForUser],
  )

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.58)}`,
          backgroundColor: alpha(theme.palette.background.default, theme.palette.mode === 'dark' ? 0.88 : 0.82),
          zIndex: theme.zIndex.drawer + 2,
        }}
      >
        <Toolbar sx={{ minHeight: '72px !important', px: { xs: 2, md: 4 }, justifyContent: 'space-between', gap: 2.5 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
            <IconButton onClick={() => setAppsOpen((value) => !value)} edge="start">
              {appsOpen ? <CloseIcon /> : <AppsIcon />}
            </IconButton>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {currentItem?.label ?? appName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentItem?.description ?? appSubtitle}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
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
                <Typography variant="subtitle2">{user?.fullName ?? 'Portal user'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email ?? user?.username}
                </Typography>
              </Box>
              {profileMenuItemsForUser.length > 0 ? <Divider /> : null}
              {profileMenuItemsForUser.map((item) => {
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

      <Portal>
        <Fade in={appsOpen}>
          <Backdrop
            open={appsOpen}
            onClick={() => setAppsOpen(false)}
            sx={{
              zIndex: theme.zIndex.drawer + 1,
              backgroundColor: alpha(theme.palette.background.default, theme.palette.mode === 'dark' ? 0.82 : 0.72),
              alignItems: 'flex-start',
              justifyContent: 'stretch',
            }}
          >
            <Box sx={{ width: '100%', px: { xs: 2, md: 4 }, pt: '88px' }} onClick={(event) => event.stopPropagation()}>
              <Card sx={{ backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.94 : 0.96), borderRadius: 4 }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography variant="h6">Applications</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Open the apps available to your account.
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {navigationItemsForUser.map((item) => {
                        const key = isExternalItem(item) ? item.href : item.path

                        return (
                          <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                              <CardActionArea
                                sx={{ height: '100%', alignItems: 'stretch' }}
                                onClick={() => {
                                  setAppsOpen(false)
                                  if (isExternalItem(item)) {
                                    window.location.assign(item.href)
                                  } else {
                                    navigate(item.path)
                                  }
                                }}
                              >
                                <CardContent sx={{ p: 2.5 }}>
                                  <Stack spacing={1.5}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                      {item.icon}
                                      <Typography variant="h6">{item.label}</Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                      {item.description}
                                    </Typography>
                                  </Stack>
                                </CardContent>
                              </CardActionArea>
                            </Card>
                          </Grid>
                        )
                      })}
                    </Grid>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Backdrop>
        </Fade>
      </Portal>

      <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
        <Outlet />
      </Box>
    </Box>
  )
}
