import AppsIcon from '@mui/icons-material/Apps'
import LaunchIcon from '@mui/icons-material/Launch'
import LinkIcon from '@mui/icons-material/Link'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { ApplicationCard } from '@fullstackmicrostarter/ui'
import { workspaceUrl } from '../config/env.ts'

const handyLinks = [
  {
    title: 'Portal admin',
    description: 'Open the protected portal admin area if your role allows it.',
    href: '/admin',
  },
]

export default function PortalLandingPage() {
  const theme = useTheme()

  return (
    <Stack spacing={3}>
      <Card sx={{ backgroundColor: alpha(theme.palette.background.paper, 0.9) }}>
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Stack spacing={1.75}>
            <Chip label="Portal Overview" color="primary" variant="outlined" sx={{ alignSelf: 'flex-start', borderRadius: 2.5 }} />
            <Typography variant="h3">Open the apps available to your account.</Typography>
            <Typography variant="body1" color="text.secondary">
              Find all your apps here, manage your account and messages
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', backgroundColor: alpha(theme.palette.background.paper, 0.9) }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <AppsIcon color="primary" />
                  <Typography variant="h6">Portal direction</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Portal now acts as the main launcher surface, while product apps stay focused on their own workflows and link back here through the profile menu.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <LaunchIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    The workspace opens on its own frontend origin.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ backgroundColor: alpha(theme.palette.background.paper, 0.9) }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <LinkIcon color="primary" />
              <Typography variant="h6">Handy links</Typography>
            </Box>
            <Grid container spacing={2}>
              {handyLinks.map((link) => (
                <Grid key={link.title} size={{ xs: 12, md: 6 }}>
                  <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
                    <CardActionArea sx={{ height: '100%' }} href={link.href}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Stack spacing={1}>
                          <Typography variant="h6">{link.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {link.description}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
