import { useAuth } from '@fullstackmicrostarter/auth'
import { SignInScreen } from '@fullstackmicrostarter/ui'

export default function PortalLoginPage() {
  const { login } = useAuth()

  return (
    <SignInScreen
      badgeLabel="Starter Portal"
      title="Welcome to the Starter Portal"
      description="Sign in to access the starter portal. All your tools are in one place. Log in once to get started."
      onSignIn={() => void login()}
    />
  )
}
