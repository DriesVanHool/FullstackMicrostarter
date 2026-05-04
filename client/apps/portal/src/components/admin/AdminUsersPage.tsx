import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { Alert, Box, Button, Stack } from '@mui/material'
import { PageIntroCard } from '@fullstackmicrostarter/ui'
import CreateUserDialog from './CreateUserDialog.tsx'
import UserManagementTable from './UserManagementTable.tsx'
import { useUserAdminService } from '../../services/userAdminService.ts'
import type { IUserRequest } from '../../models/IUserRequest.ts'
import type { IUserResponse } from '../../models/IUserResponse.ts'

const SUCCESS_MESSAGE = 'User created. An email was sent asking the user to verify their address and set or reset their password.'
const UPDATE_SUCCESS_MESSAGE = 'User updated.'
const DELETE_SUCCESS_MESSAGE = 'User deleted.'

type UserDialogMode = 'closed' | 'details' | 'edit' | 'confirm-delete'

interface UserDialogState {
  mode: UserDialogMode
  selectedUser?: IUserResponse
}

const ADMIN_USERS_QUERY_KEY = ['admin-users'] as const

function toUserFormValues(user?: IUserResponse) {
  if (!user) {
    return undefined
  }

  return {
    email: user.email,
    firstName: user.firstname,
    lastName: user.lastname,
    roles: user.roles ?? [],
  }
}

function getDeleteDialogState(selectedUser?: IUserResponse): UserDialogState {
  return selectedUser
    ? {
        mode: 'confirm-delete',
        selectedUser,
      }
    : { mode: 'closed' }
}

function getDetailsDialogState(selectedUser?: IUserResponse): UserDialogState {
  return selectedUser
    ? {
        mode: 'details',
        selectedUser,
      }
    : { mode: 'closed' }
}

function getEditDialogState(selectedUser?: IUserResponse): UserDialogState {
  return selectedUser
    ? {
        mode: 'edit',
        selectedUser,
      }
    : { mode: 'closed' }
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient()
  const userAdminService = useUserAdminService()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [userDialogState, setUserDialogState] = useState<UserDialogState>({ mode: 'closed' })
  const [successMessage, setSuccessMessage] = useState<string>()

  const createUserMutation = useMutation({
    mutationFn: (request: IUserRequest) => userAdminService.createUser(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
      setCreateDialogOpen(false)
      setSuccessMessage(SUCCESS_MESSAGE)
    },
  })

  const selectedUserId = userDialogState.selectedUser?.id

  const selectedUserQuery = useQuery({
    queryKey: ['admin-user', selectedUserId],
    queryFn: () => userAdminService.getUserById(selectedUserId!),
    enabled: Boolean(selectedUserId) && userDialogState.mode !== 'closed',
  })

  const updateUserMutation = useMutation({
    mutationFn: (request: IUserRequest) => userAdminService.updateUser(selectedUserId!, request),
    onSuccess: async (updatedUser) => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
      await queryClient.invalidateQueries({ queryKey: ['admin-user', selectedUserId] })
      setUserDialogState(getDetailsDialogState(updatedUser))
      setSuccessMessage(UPDATE_SUCCESS_MESSAGE)
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => userAdminService.deleteUser(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
      setUserDialogState({ mode: 'closed' })
      setSuccessMessage(DELETE_SUCCESS_MESSAGE)
    },
  })

  const handleCreateDialogOpen = () => {
    setUserDialogState({ mode: 'closed' })
    setSuccessMessage(undefined)
    createUserMutation.reset()
    setCreateDialogOpen(true)
  }

  const handleCreateDialogClose = () => {
    if (createUserMutation.isPending) {
      return
    }

    createUserMutation.reset()
    setCreateDialogOpen(false)
  }

  const handleUserSelect = (user: IUserResponse) => {
    setSuccessMessage(undefined)
    updateUserMutation.reset()
    deleteUserMutation.reset()
    setUserDialogState(getDetailsDialogState(user))
  }

  const handleUserDialogClose = () => {
    if (selectedUserQuery.isLoading || updateUserMutation.isPending || deleteUserMutation.isPending) {
      return
    }

    updateUserMutation.reset()
    setUserDialogState({ mode: 'closed' })
  }

  const handleEditIntent = () => {
    setSuccessMessage(undefined)
    updateUserMutation.reset()
    setUserDialogState((currentState) => getEditDialogState(currentState.selectedUser))
  }

  const handleDeleteIntent = () => {
    setUserDialogState((currentState) => getDeleteDialogState(currentState.selectedUser))
  }

  const handleDeleteConfirmClose = () => {
    if (deleteUserMutation.isPending) {
      return
    }

    setUserDialogState((currentState) => getDetailsDialogState(currentState.selectedUser))
  }

  const handleEditClose = () => {
    if (updateUserMutation.isPending) {
      return
    }

    updateUserMutation.reset()
    setUserDialogState((currentState) => getDetailsDialogState(currentState.selectedUser))
  }

  const handleDeleteUser = () => {
    if (!selectedUserId || deleteUserMutation.isPending) {
      return
    }

    deleteUserMutation.mutate(selectedUserId)
  }

  const selectedUserDetails = selectedUserQuery.data ?? userDialogState.selectedUser
  const detailsError = selectedUserQuery.error instanceof Error ? selectedUserQuery.error.message : undefined
  const updateError = updateUserMutation.error instanceof Error ? updateUserMutation.error.message : undefined
  const deleteError = deleteUserMutation.error instanceof Error ? deleteUserMutation.error.message : undefined
  const detailsDialogOpen = userDialogState.mode === 'details'
  const editDialogOpen = userDialogState.mode === 'edit'
  const confirmDeleteOpen = userDialogState.mode === 'confirm-delete'

  const actionDisabled = useMemo(
    () => !selectedUserDetails || Boolean(detailsError) || selectedUserQuery.isLoading || updateUserMutation.isPending || deleteUserMutation.isPending,
    [deleteUserMutation.isPending, detailsError, selectedUserDetails, selectedUserQuery.isLoading, updateUserMutation.isPending],
  )

  return (
    <Stack spacing={3}>
      <PageIntroCard
        badgeLabel="User management"
        title="User overview"
        description="Search and maintain platform user profiles. Tap a row to inspect, edit, or delete a user."
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}
      >
        <Box sx={{ flex: 1 }}>
          {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
          {deleteError && !confirmDeleteOpen ? <Alert severity="error" sx={{ mt: successMessage ? 1.5 : 0 }}>{deleteError}</Alert> : null}
        </Box>
        <Box sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateDialogOpen} fullWidth>
            Create user
          </Button>
        </Box>
      </Stack>

      <UserManagementTable onUserSelect={handleUserSelect} />

      <CreateUserDialog
        key={createDialogOpen ? 'create-open' : 'create-closed'}
        open={createDialogOpen}
        mode="create"
        submitError={createUserMutation.error instanceof Error ? createUserMutation.error.message : undefined}
        isSubmitting={createUserMutation.isPending}
        onClose={handleCreateDialogClose}
        onSubmit={(request) => createUserMutation.mutate(request)}
      />

      <CreateUserDialog
        key={`user-dialog-${userDialogState.mode}-${selectedUserId ?? 'none'}`}
        open={detailsDialogOpen || confirmDeleteOpen || editDialogOpen}
        mode={confirmDeleteOpen ? 'confirm-delete' : editDialogOpen ? 'edit' : 'view'}
        initialValues={toUserFormValues(selectedUserDetails)}
        submitError={confirmDeleteOpen ? deleteError : editDialogOpen ? updateError : detailsError}
        isSubmitting={selectedUserQuery.isLoading || updateUserMutation.isPending || deleteUserMutation.isPending}
        onClose={confirmDeleteOpen ? handleDeleteConfirmClose : editDialogOpen ? handleEditClose : handleUserDialogClose}
        onSubmit={(request) => updateUserMutation.mutate(request)}
        onConfirmDelete={handleDeleteUser}
        secondaryAction={
          confirmDeleteOpen ? undefined : editDialogOpen ? undefined : (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button onClick={handleEditIntent} disabled={actionDisabled} variant="outlined" startIcon={<EditIcon />}>
                Edit user
              </Button>
              <Button onClick={handleDeleteIntent} disabled={actionDisabled} color="error" variant="outlined" startIcon={<DeleteIcon />}>
                Delete user
              </Button>
            </Stack>
          )
        }
      />
    </Stack>
  )
}
