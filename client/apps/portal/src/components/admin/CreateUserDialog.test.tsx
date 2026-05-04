import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import CreateUserDialog from './CreateUserDialog.tsx'

interface MockFormDialogProps {
  open: boolean
  title: string
  description?: ReactNode
  secondaryAction?: ReactNode
  children?: ReactNode
}

vi.mock('@fullstackmicrostarter/ui', () => ({
  FormDialog: ({ open, title, description, secondaryAction, children }: MockFormDialogProps) =>
    open ? (
      <div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
        <div>{children}</div>
        <div>{secondaryAction}</div>
      </div>
    ) : null,
}))

describe('CreateUserDialog', () => {
  afterEach(() => {
    cleanup()
  })

  it('does not show the delete warning while viewing user details', () => {
    render(
      <CreateUserDialog
        open
        mode="view"
        initialValues={{
          email: 'dries@example.com',
          firstName: 'Dries',
          lastName: 'Van Hool',
          roles: ['ADMIN'],
        }}
        onClose={() => {}}
      />,
    )

    expect(screen.getByText('User details')).toBeInTheDocument()
    expect(screen.getByText('Review the selected user before taking any destructive action.')).toBeInTheDocument()
    expect(screen.queryByText(/deletes the linked user account/i)).not.toBeInTheDocument()
  })

  it('shows loading placeholders in the details dialog while the selected user is still loading', () => {
    render(<CreateUserDialog open mode="view" isSubmitting onClose={() => {}} />)

    expect(screen.getAllByText('User details').length).toBeGreaterThan(0)
    expect(screen.getByText('First name')).toBeInTheDocument()
    expect(screen.getByText('Last name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Roles')).toBeInTheDocument()
    expect(screen.queryByText('Loading assigned roles…')).not.toBeInTheDocument()
    expect(screen.queryByText('No roles found for this user.')).not.toBeInTheDocument()
  })

  it('uses provider-neutral account setup copy in create mode', () => {
    render(<CreateUserDialog open mode="create" onClose={() => {}} />)

    expect(screen.getByText('Create the user in the platform and send the standard account setup email.')).toBeInTheDocument()
    expect(screen.getByText('Must be unique. This email is used for verification and password setup.')).toBeInTheDocument()
  })

  it('shows edit-mode copy that keeps email read-only', () => {
    render(
      <CreateUserDialog
        open
        mode="edit"
        initialValues={{
          email: 'dries@example.com',
          firstName: 'Dries',
          lastName: 'Van Hool',
          roles: ['ADMIN'],
        }}
        onClose={() => {}}
      />,
    )

    expect(screen.getByText('Edit user')).toBeInTheDocument()
    expect(screen.getByText('Update the selected user. Email stays fixed; only names and roles are editable.')).toBeInTheDocument()
    expect(screen.getByText('Email cannot be changed after creation.')).toBeInTheDocument()
  })
})
