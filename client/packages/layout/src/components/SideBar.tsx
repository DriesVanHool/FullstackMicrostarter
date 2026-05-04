import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import MenuIcon from '@mui/icons-material/Menu'
import { Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Stack, Toolbar, Typography, alpha, useTheme } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import type { NavigationItem } from '../models/NavigationItem.ts'

interface SideBarProps {
  appName: string
  appSubtitle: string
  collapsed: boolean
  mobileOpen: boolean
  isMobile: boolean
  onToggleCollapsed: () => void
  onToggleMobile: () => void
  onCloseMobile: () => void
  navigationItems: NavigationItem[]
}

export const drawerWidth = 280
export const collapsedDrawerWidth = 88

const isCurrentPath = (currentPath: string, itemPath: string) => {
  if (itemPath === '/') {
    return currentPath === '/'
  }

  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`)
}

const isExternalItem = (item: NavigationItem): item is Extract<NavigationItem, { href: string }> => 'href' in item

export function SideBar({
  appName,
  appSubtitle,
  collapsed,
  mobileOpen,
  isMobile,
  onToggleCollapsed,
  onToggleMobile,
  onCloseMobile,
  navigationItems,
}: SideBarProps) {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const currentDrawerWidth = collapsed ? collapsedDrawerWidth : drawerWidth
  const desktopOpen = !collapsed

  const handleNavigate = (target: string, external = false) => {
    if (external) {
      window.location.assign(target)
    } else {
      navigate(target)
    }

    if (isMobile) {
      onCloseMobile()
    }
  }

  const drawerContent = (
    <>
      <Toolbar
        sx={{
          minHeight: '72px !important',
          px: 2,
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
        }}
      >
        {(!collapsed || isMobile) ? (
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ letterSpacing: '-0.02em' }}>{appName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {appSubtitle}
            </Typography>
          </Stack>
        ) : null}
        <IconButton onClick={isMobile ? onToggleMobile : onToggleCollapsed}>
          {isMobile || desktopOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>

      <List sx={{ px: 1.5, py: 1.5, gap: 0.5, display: 'grid' }}>
        {navigationItems.map((item: NavigationItem) => {
          const sharedSx = {
            minHeight: 48,
            borderRadius: 2.5,
            px: collapsed && !isMobile ? 1.5 : 2,
            justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
            transition: theme.transitions.create(['padding', 'justify-content'], {
              duration: theme.transitions.duration.shorter,
            }),
          }

          if (isExternalItem(item)) {
            return (
              <ListItemButton key={item.href} onClick={() => handleNavigate(item.href, true)} sx={sharedSx}>
                {item.icon ? <ListItemIcon sx={{ minWidth: collapsed && !isMobile ? 'auto' : 40, color: 'inherit' }}>{item.icon}</ListItemIcon> : null}
                {(!collapsed || isMobile) ? <ListItemText primary={item.label} /> : null}
              </ListItemButton>
            )
          }

          const selected = isCurrentPath(location.pathname, item.path)

          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => handleNavigate(item.path)}
              sx={{
                ...sharedSx,
                border: `1px solid ${selected ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.24 : 0.16) : 'transparent'}`,
              }}
            >
              {item.icon ? <ListItemIcon sx={{ minWidth: collapsed && !isMobile ? 'auto' : 40, color: 'inherit' }}>{item.icon}</ListItemIcon> : null}
              {(!collapsed || isMobile) ? <ListItemText primary={item.label} /> : null}
            </ListItemButton>
          )
        })}
      </List>
      <Box sx={{ flexGrow: 1 }} />
    </>
  )

  return (
    <>
      <Drawer
        variant="temporary"
        open={isMobile ? mobileOpen : false}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: '100vw',
            boxSizing: 'border-box',
            borderRight: 'none',
            backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.96 : 0.98),
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: currentDrawerWidth,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            duration: theme.transitions.duration.enteringScreen,
            easing: theme.transitions.easing.easeInOut,
          }),
          '& .MuiDrawer-paper': {
            width: currentDrawerWidth,
            boxSizing: 'border-box',
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.62)}`,
            backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.9 : 0.94),
            transition: theme.transitions.create('width', {
              duration: theme.transitions.duration.enteringScreen,
              easing: theme.transitions.easing.easeInOut,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  )
}
