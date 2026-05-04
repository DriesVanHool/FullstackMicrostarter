import type {ReactNode} from 'react'
import {alpha, Card, CardContent, Stack, Typography, useTheme} from '@mui/material'

interface NavigationProps {
    title?: string
    description: string
    icon?: ReactNode
    actions?: ReactNode
    children?: ReactNode
}

export function NavigationCard({title, description, icon, actions, children}: NavigationProps) {
    const theme = useTheme()

    return (
        <Card sx={{backgroundColor: alpha(theme.palette.background.paper, 0.9)}}>
            <CardContent sx={{p: {xs: 2.5, md: 3}}}>
                <Stack spacing={2}>
                    {title ? (
                        <Stack direction="row" spacing={1.25} sx={{alignItems: 'center'}}>
                            {icon}
                            <Typography variant="h6">{title}</Typography>
                        </Stack>
                    ) : null}
                    <Typography variant="body2" color="text.secondary">
                        {description}
                    </Typography>
                    {children}
                    {actions}
                </Stack>
            </CardContent>
        </Card>
    )
}
