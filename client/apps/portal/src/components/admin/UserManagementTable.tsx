import { useEffect, useMemo, useState } from 'react'
import GroupIcon from '@mui/icons-material/Group'
import SearchIcon from '@mui/icons-material/Search'
import { Alert, InputAdornment, MenuItem, Stack, TextField } from '@mui/material'
import { usePageableTable, usePagedQuery } from '@fullstackmicrostarter/api-client'
import { type PageableColumn, PageableTable } from '@fullstackmicrostarter/ui'
import type { IUserResponse } from '../../models/IUserResponse.ts'
import { useUserAdminService } from '../../services/userAdminService.ts'

const ADMIN_USERS_QUERY_KEY = ['admin-users'] as const

function buildUserSearch(search: string) {
  const trimmed = search.trim()

  if (!trimmed) {
    return ''
  }

  return [`firstName~${trimmed}`, `lastName~${trimmed}`, `email~${trimmed}`].join('|')
}

const columns: PageableColumn<IUserResponse>[] = [
  { key: 'firstname', header: 'First name', render: (user) => user.firstname },
  { key: 'lastname', header: 'Last name', render: (user) => user.lastname },
  { key: 'email', header: 'Email', render: (user) => user.email },
]

interface UserManagementTableProps {
  onUserSelect?: (user: IUserResponse) => void
}

export default function UserManagementTable({ onUserSelect }: UserManagementTableProps) {
  const userAdminService = useUserAdminService()
  const { page, size, search, sortBy, orderBy, setPage, setSize, setSearch, setSortBy, setOrderBy } = usePageableTable({
    size: 10,
    sortBy: 'lastName',
    orderBy: 'asc',
  })
  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput)
      }
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [search, searchInput, setSearch])

  const searchQuery = useMemo(() => buildUserSearch(search), [search])
  const usersQueryKey = [...ADMIN_USERS_QUERY_KEY, page, size, searchQuery, sortBy, orderBy]

  const { data, isLoading, isError, error } = usePagedQuery(usersQueryKey, () => userAdminService.getUsersPage(page, size, searchQuery, sortBy, orderBy))

  return (
    <Stack spacing={3}>
      {isError ? <Alert severity="error">{error instanceof Error ? error.message : 'Failed to load users.'}</Alert> : null}
      <PageableTable
        icon={<GroupIcon color="primary" />}
        title="Users"
        filters={
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by first name, last name, or email"
              size="small"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              select
              size="small"
              label="Sort by"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              sx={{ minWidth: { xs: '100%', md: 180 } }}
            >
              <MenuItem value="firstName">First name</MenuItem>
              <MenuItem value="lastName">Last name</MenuItem>
              <MenuItem value="email">Email</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              label="Order"
              value={orderBy}
              onChange={(event) => setOrderBy(event.target.value as 'asc' | 'desc')}
              sx={{ minWidth: { xs: '100%', md: 140 } }}
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </TextField>
          </Stack>
        }
        rows={data?.content ?? []}
        columns={columns}
        page={page}
        size={size}
        totalElements={data?.totalElements ?? 0}
        onPageChange={setPage}
        onSizeChange={setSize}
        emptyMessage={isLoading ? 'Loading users…' : 'No users match the current filters.'}
        getRowKey={(user) => user.id}
        onRowClick={onUserSelect}
      />
    </Stack>
  )
}
