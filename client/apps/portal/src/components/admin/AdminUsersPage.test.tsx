import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import AdminUsersPage from './AdminUsersPage.tsx'

const invalidateQueries = vi.fn()
const resetCreateMutation = vi.fn()
const resetUpdateMutation = vi.fn()
const resetDeleteMutation = vi.fn()
const mutateCreate = vi.fn()
const mutateUpdate = vi.fn()
const mutateDelete = vi.fn()

const mockUser = {
  id: 'user-1',
  firstname: 'Dries',
  lastname: 'Van Hool',
  email: 'dries@example.com',
  roles: ['ADMIN'],
}

const secondMockUser = {
  id: 'user-2',
  firstname: 'Robin',
  lastname: 'Vandenberghe',
  email: 'robin@example.com',
  roles: ['USER'],
}

interface MutationOptions {
  mutationFn: unknown
  onSuccess?: (value?: typeof mockUser) => Promise<void>
}

interface PageIntroCardProps {
  title: string
  description: string
}

interface UserManagementTableProps {
  onUserSelect: (user: typeof mockUser) => void
}

interface CreateUserDialogProps {
  open: boolean
  mode: 'create' | 'view' | 'edit' | 'confirm-delete'
  secondaryAction?: ReactNode
  submitError?: string
  onConfirmDelete?: () => void
}

let latestOnUserSelect: UserManagementTableProps['onUserSelect']

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries }),
  useMutation: ({ mutationFn, onSuccess }: MutationOptions) => {
    const mutationSource = String(mutationFn)
    const isDeleteMutation = mutationSource.includes('deleteUser')
    const isUpdateMutation = mutationSource.includes('updateUser')

    if (isDeleteMutation) {
      return { mutate: mutateDelete, reset: resetDeleteMutation, isPending: false, error: null, onSuccess }
    }

    if (isUpdateMutation) {
      return { mutate: mutateUpdate, reset: resetUpdateMutation, isPending: false, error: null, onSuccess }
    }

    return { mutate: mutateCreate, reset: resetCreateMutation, isPending: false, error: null, onSuccess }
  },
  useQuery: () => ({ data: mockUser, isLoading: false, error: null }),
}))

vi.mock('@fullstackmicrostarter/ui', () => ({
  PageIntroCard: ({ title, description }: PageIntroCardProps) => (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
}))

vi.mock('./UserManagementTable.tsx', () => ({
  default: ({ onUserSelect }: UserManagementTableProps) => {
    latestOnUserSelect = onUserSelect

    return (
      <div>
        <button onClick={() => onUserSelect(mockUser)}>Open user</button>
        <button onClick={() => onUserSelect(secondMockUser)}>Open another user</button>
      </div>
    )
  },
}))

vi.mock('./CreateUserDialog.tsx', () => ({
  default: ({ open, mode, secondaryAction, onConfirmDelete }: CreateUserDialogProps) =>
    open ? (
      <div>
        <h2>{mode === 'view' ? 'User details' : mode === 'edit' ? 'Edit user' : mode === 'confirm-delete' ? 'Delete user' : 'Create user'}</h2>
        {mode === 'confirm-delete' ? (
          <>
            <p>This permanently removes the user profile from the platform and deletes the linked user account.</p>
            <button onClick={onConfirmDelete}>Delete user</button>
          </>
        ) : (
          secondaryAction
        )}
      </div>
    ) : null,
}))

vi.mock('../../services/userAdminService.ts', () => ({
  useUserAdminService: () => ({
    createUser: vi.fn(),
    getUserById: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  }),
}))

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('keeps delete confirmation out of the details dialog and shows a single delete action in the confirm step', () => {
    render(<AdminUsersPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Open user' }))

    expect(screen.getByText('User details')).toBeInTheDocument()
    expect(screen.queryByText(/This permanently removes the user profile from the platform/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete user' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit user' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Delete user' }))

    expect(screen.queryByText('User details')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Delete user' })).toBeInTheDocument()
    expect(screen.getByText(/This permanently removes the user profile from the platform/i)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Delete user' })).toHaveLength(1)
  })

  it('replaces an open delete confirmation with user details immediately when another user is selected', () => {
    render(<AdminUsersPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Open user' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete user' }))

    expect(screen.getByText(/This permanently removes the user profile from the platform/i)).toBeInTheDocument()

    act(() => {
      latestOnUserSelect(secondMockUser)
    })

    expect(screen.getByText('User details')).toBeInTheDocument()
    expect(screen.queryByText(/This permanently removes the user profile from the platform/i)).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Delete user' })).toHaveLength(1)
  })

  it('opens edit mode from the details dialog', () => {
    render(<AdminUsersPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Open user' }))
    fireEvent.click(screen.getByRole('button', { name: 'Edit user' }))

    expect(screen.getByRole('heading', { name: 'Edit user' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete user' })).not.toBeInTheDocument()
  })
})
