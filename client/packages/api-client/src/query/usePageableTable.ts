import { useState } from 'react'

export interface PageableTableState {
  page: number
  size: number
  search: string
  sortBy: string
  orderBy: 'asc' | 'desc'
}

export function usePageableTable(initialState?: Partial<PageableTableState>) {
  const [page, setPage] = useState(initialState?.page ?? 0)
  const [size, setSize] = useState(initialState?.size ?? 10)
  const [search, setSearchState] = useState(initialState?.search ?? '')
  const [sortBy, setSortBy] = useState(initialState?.sortBy ?? '')
  const [orderBy, setOrderBy] = useState<'asc' | 'desc'>(initialState?.orderBy ?? 'asc')

  return {
    page,
    size,
    search,
    sortBy,
    orderBy,
    setPage,
    setSize: (nextSize: number) => {
      setPage(0)
      setSize(nextSize)
    },
    setSearch: (value: string) => {
      setPage(0)
      setSearchState(value)
    },
    setSortBy: (value: string) => {
      setPage(0)
      setSortBy(value)
    },
    setOrderBy: (value: 'asc' | 'desc') => {
      setPage(0)
      setOrderBy(value)
    },
  }
}
