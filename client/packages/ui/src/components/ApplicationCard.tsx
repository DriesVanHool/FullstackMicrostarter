import {alpha, Button, Card, CardActions, CardContent, Chip, Stack, Typography, useTheme} from '@mui/material'

interface ApplicationCardProps {
    badgeLabel: string
    title: string
    description: string
    href: string
    actionLabel: string
}

export function ApplicationCard({badgeLabel, title, description, href, actionLabel}: ApplicationCardProps) {
    const theme = useTheme()

    return (
        <Card sx={{height: '100%', backgroundColor: alpha(theme.palette.background.paper, 0.5)}}>
            <CardContent sx={{p: {xs: 2.5, md: 3}}}>
                <Stack spacing={2}>
                    <Chip label={badgeLabel} color="secondary" variant="outlined"
                          sx={{alignSelf: 'flex-start', borderRadius: 2.5}}/>
                    <Stack spacing={1}>
                        <Typography variant="h5">{title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {description}
                        </Typography>
                    </Stack>
                </Stack>
            </CardContent>
            <CardActions sx={{px: 3, pb: 3, pt: 0}}>
                <Button variant="contained" href={href} sx={{borderRadius: 1.5}}>
                    {actionLabel}
                </Button>
            </CardActions>
        </Card>
    )
}
