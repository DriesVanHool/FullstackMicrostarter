import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import { Button, Stack } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { PageIntroCard, NavigationCard } from '@fullstackmicrostarter/ui'

export default function AdminLandingPage() {
  return (
    <Stack spacing={3}>
      <PageIntroCard
        badgeLabel="Admin area"
        title="Portal administration"
        description="This page is the admin entry point for portal-level management and configuration."
      />

      <NavigationCard
        icon={<AdminPanelSettingsIcon color="primary" />}
        title="User management"
        description="Manage platform users through the protected admin flow. Only admins should be able to navigate here or call the underlying admin endpoints."
        actions={
          <Button
            variant="contained"
            startIcon={<ManageAccountsIcon />}
            component={RouterLink}
            to="/admin/users"
            sx={{ alignSelf: 'flex-start', borderRadius: 1.5 }}
          >
            Open user management
          </Button>
        }
      />
    </Stack>
  )
}
