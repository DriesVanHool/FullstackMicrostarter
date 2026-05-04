import { Alert, Box, Button, Card, CardContent, Chip, Container, Stack, Typography, alpha, useTheme } from '@mui/material'

interface SignInScreenProps {
  badgeLabel: string
  title: string
  description: string
  onSignIn: () => void
}

export function SignInScreen({ badgeLabel, title, description, onSignIn }: SignInScreenProps) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: theme.palette.mode === 'dark'
          ? `radial-gradient(circle at top, ${alpha(theme.palette.primary.main, 0.12)} 0%, transparent 38%), linear-gradient(180deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.background.paper, 0.98)} 100%)`
          : `radial-gradient(circle at top, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 38%), linear-gradient(180deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.background.paper, 0.96)} 100%)`,
        py: { xs: 3, md: 6 },
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.92 : 0.96) }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3}>
              <Stack spacing={1.5}>
                <Chip label={badgeLabel} color="primary" sx={{ alignSelf: 'flex-start', borderRadius: 2.5 }} />
                <Typography variant="h2">{title}</Typography>
                <Typography variant="body1" color="text.secondary">
                  {description}
                </Typography>
              </Stack>

              <Alert severity="info" variant="outlined">
                Your session is secure and ends automatically when you close the browser.
              </Alert>

              <Stack spacing={1.5}>
                <Button variant="contained" size="large" onClick={onSignIn}>
                  Sign in
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account? Contact your administrator to get access.
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
