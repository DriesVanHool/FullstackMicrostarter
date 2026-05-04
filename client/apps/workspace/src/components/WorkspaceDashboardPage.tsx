import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Card, CardContent, Grid, LinearProgress, Stack, Typography, alpha, useTheme } from '@mui/material'
import { useAuth } from '@fullstackmicrostarter/auth'
import { PageIntroCard, NavigationCard } from '@fullstackmicrostarter/ui'

const metrics = [
  { label: 'Active sessions', value: '124', detail: 'This week across all enabled modules' },
  { label: 'Completion readiness', value: '78%', detail: 'Average readiness score for the current cohort' },
  { label: 'Module completion', value: '63%', detail: 'Completion progress across assigned users' },
]

const focusAreas = [
  { title: 'Core workflows', progress: 84, description: 'Users are trending upward in the most-used workspace flows.' },
  { title: 'Knowledge checks', progress: 58, description: 'Weak answers still cluster around a few recurring concepts.' },
  { title: 'Review content', progress: 71, description: 'Targeted review sets are reducing repeated mistakes.' },
]

export default function WorkspaceDashboardPage() {
  const { user } = useAuth()
  const theme = useTheme()

  return (
    <Stack spacing={3}>
      <Grid container spacing={2.5}>
        {metrics.map((metric) => (
          <Grid size={{ xs: 12, md: 4 }} key={metric.label}>
            <Card sx={{ height: '100%', backgroundColor: alpha(theme.palette.background.paper, 0.88) }}>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    {metric.label}
                  </Typography>
                  <Typography variant="h4">{metric.value}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {metric.detail}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
