import { useAuth } from '@fullstackmicrostarter/auth'
import { SignInScreen } from '@fullstackmicrostarter/ui'

export default function WorkspaceLoginPage() {
  const { login } = useAuth()

  return (
    <SignInScreen
      badgeLabel="Workspace"
      title="Access the workspace"
      description="Sign in to access the workspace, explore enabled modules, and continue where you left off."
      onSignIn={() => void login()}
    />
  )
}
