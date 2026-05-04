import type { ReactNode } from 'react'
import { Card, CardContent, Chip, Stack, Typography, alpha, useTheme } from '@mui/material'

interface PageIntroCardProps {
  badgeLabel: string
  title: string
  description: string
  badgeColor?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
  children?: ReactNode
}

export function PageIntroCard({ badgeLabel, title, description, badgeColor = 'primary', children }: PageIntroCardProps) {
  const theme = useTheme()

  return (
    <Card sx={{ backgroundColor: alpha(theme.palette.background.paper, 0.9) }}>
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        <Stack spacing={1.75}>
          <Chip label={badgeLabel} color={badgeColor} variant="outlined" sx={{ alignSelf: 'flex-start', borderRadius: 1.5 }} />
          <Typography variant="h3">{title}</Typography>
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
          {children}
        </Stack>
      </CardContent>
    </Card>
  )
}
