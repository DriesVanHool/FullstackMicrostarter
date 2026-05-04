import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import { z } from 'zod'
import { Alert, AlertTitle, Box, Chip, FormControl, FormHelperText, FormLabel, Skeleton, Stack, TextField, ToggleButton, Typography } from '@mui/material'
import { AuthRole } from '@fullstackmicrostarter/auth'
import { FormDialog } from '@fullstackmicrostarter/ui'
import type { IUserRequest } from '../../models/IUserRequest.ts'

interface UserFormValues {
  email: string
  firstName: string
  lastName: string
  roles: string[]
}

const CREATE_USER_ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: AuthRole.ADMIN, label: 'Admin' },
  { value: AuthRole.USER, label: 'User' },
]

function getDefaultUserFormValues(): UserFormValues {
  return {
    email: '',
    firstName: '',
    lastName: '',
    roles: [],
  }
}

type CreateUserFormErrors = Partial<Record<keyof UserFormValues, string>>

const createUserFormSchema = z.object({
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email address.'),
  firstName: z.string().trim().min(1, 'First name is required.'),
  lastName: z.string().trim().min(1, 'Last name is required.'),
  roles: z.array(z.string()).min(1, 'Select at least one role.'),
})

function validateCreateUserForm(values: UserFormValues): CreateUserFormErrors {
  const parsedValues = createUserFormSchema.safeParse(values)

  if (parsedValues.success) {
    return {}
  }

  const fieldErrors = parsedValues.error.flatten().fieldErrors

  return {
    email: fieldErrors.email?.[0],
    firstName: fieldErrors.firstName?.[0],
    lastName: fieldErrors.lastName?.[0],
    roles: fieldErrors.roles?.[0],
  }
}

function hasCreateUserFormErrors(errors: CreateUserFormErrors) {
  return Object.values(errors).some(Boolean)
}

function toCreateUserRequest(values: UserFormValues): IUserRequest {
  return {
    email: values.email.trim().toLowerCase(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    roles: values.roles,
  }
}

interface UserDetailsDialogProps {
  open: boolean
  mode?: 'create' | 'view' | 'edit' | 'confirm-delete'
  initialValues?: UserFormValues
  submitError?: string
  isSubmitting?: boolean
  onClose: () => void
  onSubmit?: (request: IUserRequest) => void
  onConfirmDelete?: () => void
  secondaryAction?: ReactNode
}

interface LoadingFieldProps {
  label: string
  width?: string | number
  helperTextWidth?: string | number
}

function LoadingField({ label, width = '100%', helperTextWidth = '55%' }: LoadingFieldProps) {
  return (
    <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Skeleton variant="rounded" animation="wave" height={56} width={width} />
      <Skeleton variant="text" animation="wave" width={helperTextWidth} sx={{ fontSize: '0.875rem' }} />
    </Stack>
  )
}

function UserRolesField({
  values,
  editableValues,
  errors,
  isCreateMode,
  isEditable,
  onRoleToggle,
}: {
  values: UserFormValues
  editableValues: UserFormValues
  errors: CreateUserFormErrors
  isCreateMode: boolean
  isEditable: boolean
  onRoleToggle: (role: string) => void
}) {
  return (
    <FormControl required error={Boolean(errors.roles)} disabled={!isEditable}>
      <Stack spacing={1}>
        <FormLabel>Roles</FormLabel>
        {!isEditable ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {values.roles.length > 0 ? (
              values.roles.map((role) => <Chip key={role} label={role} color="primary" variant="outlined" />)
            ) : (
              <Alert severity="warning" variant="outlined" sx={{ width: '100%' }}>
                No roles found for this user.
              </Alert>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {CREATE_USER_ROLE_OPTIONS.map((roleOption) => {
              const selected = editableValues.roles.includes(roleOption.value)

              return (
                <ToggleButton
                  key={roleOption.value}
                  value={roleOption.value}
                  selected={selected}
                  onChange={() => onRoleToggle(roleOption.value)}
                  color="primary"
                  sx={{
                    px: 1.75,
                    py: 1,
                    borderRadius: 999,
                    fontWeight: 600,
                    justifyContent: 'center',
                    flexGrow: { xs: 1, sm: 0 },
                    minWidth: { xs: 'calc(50% - 4px)', sm: 120 },
                  }}
                >
                  {roleOption.label}
                </ToggleButton>
              )
            })}
          </Box>
        )}
        <FormHelperText>{errors.roles ?? (isCreateMode ? 'Assign at least one role to seed initial access.' : isEditable ? 'Only admins can change assigned roles.' : 'Current assigned roles.')}</FormHelperText>
      </Stack>
    </FormControl>
  )
}

export default function UserDetailsDialog({
  open,
  mode = 'create',
  initialValues,
  submitError,
  isSubmitting = false,
  onClose,
  onSubmit,
  onConfirmDelete,
  secondaryAction,
}: UserDetailsDialogProps) {
  const [createValues, setCreateValues] = useState<UserFormValues>(getDefaultUserFormValues)
  const [editValues, setEditValues] = useState<UserFormValues>(() => initialValues ?? getDefaultUserFormValues())
  const [errors, setErrors] = useState<CreateUserFormErrors>({})

  const isCreateMode = mode === 'create'
  const isEditMode = mode === 'edit'
  const isReadOnly = mode === 'view'
  const isEditable = isCreateMode || isEditMode
  const isDeleteConfirmMode = mode === 'confirm-delete'
  const isLoadingReadOnlyData = isReadOnly && isSubmitting && !initialValues
  const currentEditableValues = isCreateMode ? createValues : editValues
  const values = isEditable ? currentEditableValues : initialValues ?? getDefaultUserFormValues()
  const validationErrors = useMemo(() => validateCreateUserForm(currentEditableValues), [currentEditableValues])


  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isEditable) {
      return
    }

    const { name, value } = event.target
    const field = name as Exclude<keyof UserFormValues, 'roles'>
    const updateValues = isCreateMode ? setCreateValues : setEditValues

    updateValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleRoleToggle = (role: string) => {
    if (!isEditable) {
      return
    }

    const nextRoles = currentEditableValues.roles.includes(role)
      ? currentEditableValues.roles.filter((currentRole) => currentRole !== role)
      : [...currentEditableValues.roles, role]

    const updateValues = isCreateMode ? setCreateValues : setEditValues
    updateValues((current) => ({ ...current, roles: nextRoles }))
    setErrors((current) => ({ ...current, roles: undefined }))
  }

  const handleSubmit = () => {
    if (isDeleteConfirmMode) {
      onConfirmDelete?.()
      return
    }

    if (!isEditable || !onSubmit) {
      onClose()
      return
    }

    const nextErrors = validateCreateUserForm(currentEditableValues)
    setErrors(nextErrors)

    if (hasCreateUserFormErrors(nextErrors)) {
      return
    }

    onSubmit(toCreateUserRequest(currentEditableValues))
  }

  if (isDeleteConfirmMode) {
    const fullName = [values.firstName, values.lastName].filter(Boolean).join(' ').trim()
    const userLabel = fullName && values.email ? `${fullName} (${values.email})` : values.email || fullName || 'this user'

    return (
      <FormDialog
        open={open}
        title="Delete user"
        submitLabel="Delete user"
        cancelLabel="Cancel"
        onClose={onClose}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        maxWidth="sm"
        submittingLabel="Deleting…"
        submitButtonColor="error"
      >
        <Stack spacing={2.5}>
          <Alert severity="warning" variant="outlined">
            This permanently removes the user profile from the platform and deletes the linked user account.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            {`Delete ${userLabel}?`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone from the portal.
          </Typography>
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
        </Stack>
      </FormDialog>
    )
  }

  return (
    <FormDialog
      open={open}
      title={isCreateMode ? 'Create user' : isEditMode ? 'Edit user' : 'User details'}
      description={
        isCreateMode
          ? 'Create the user in the platform and send the standard account setup email.'
          : isEditMode
            ? 'Update the selected user. Email stays fixed; only names and roles are editable.'
            : 'Review the selected user before taking any destructive action.'
      }
      submitLabel={isCreateMode ? 'Create user' : isEditMode ? 'Save changes' : 'Close'}
      cancelLabel={isCreateMode || isEditMode ? 'Cancel' : undefined}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isEditable ? isSubmitting : false}
      submitDisabled={isEditable ? hasCreateUserFormErrors(validationErrors) : false}
      maxWidth="md"
      secondaryAction={secondaryAction}
      submittingLabel={isCreateMode ? 'Creating…' : isEditMode ? 'Saving…' : 'Working…'}
    >
      <Stack spacing={2.5}>
        {submitError ? (
          <Alert severity="error" variant="outlined">
            <AlertTitle>{isCreateMode ? "Couldn't create user" : isEditMode ? "Couldn't update user" : "Couldn't load user"}</AlertTitle>
            {submitError}
          </Alert>
        ) : null}

        {isLoadingReadOnlyData ? (
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <LoadingField label="First name" />
              <LoadingField label="Last name" />
            </Stack>
            <LoadingField label="Email" helperTextWidth="72%" />
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Roles
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} variant="rounded" animation="wave" width={110} height={40} sx={{ borderRadius: 999 }} />
                ))}
              </Box>
              <Skeleton variant="text" animation="wave" width="38%" sx={{ fontSize: '0.875rem' }} />
            </Stack>
          </Stack>
        ) : (
          <>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="First name"
                name="firstName"
                value={values.firstName}
                onChange={onChange}
                error={Boolean(errors.firstName)}
                helperText={errors.firstName}
                autoFocus={isEditable}
                required
                fullWidth
                disabled={!isEditable}
              />
              <TextField
                label="Last name"
                name="lastName"
                value={values.lastName}
                onChange={onChange}
                error={Boolean(errors.lastName)}
                helperText={errors.lastName}
                required
                fullWidth
                disabled={!isEditable}
              />
            </Stack>

            <TextField
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={onChange}
              error={Boolean(errors.email)}
              helperText={errors.email ?? (isCreateMode ? 'Must be unique. This email is used for verification and password setup.' : isEditMode ? 'Email cannot be changed after creation.' : 'Managed through the user service.')}
              required
              fullWidth
              disabled
            />

            <UserRolesField
              values={values}
              editableValues={currentEditableValues}
              errors={errors}
              isCreateMode={isCreateMode}
              isEditable={isEditable}
              onRoleToggle={handleRoleToggle}
            />
          </>
        )}
      </Stack>
    </FormDialog>
  )
}
