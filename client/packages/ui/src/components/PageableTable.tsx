import type { ReactNode } from 'react'
import { Box, Card, CardContent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material'

export interface PageableColumn<T> {
  key: string
  header: string
  render: (item: T) => ReactNode
}

interface PageableTableProps<T> {
  icon?: ReactNode
  title?: string
  description?: string
  filters?: ReactNode
  rows: T[]
  columns: PageableColumn<T>[]
  page: number
  size: number
  totalElements: number
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
  emptyMessage?: string
  getRowKey?: (row: T, index: number) => string | number
  onRowClick?: (row: T) => void
}

export function PageableTable<T>({
  icon,
  title,
  description,
  filters,
  rows,
  columns,
  page,
  size,
  totalElements,
  onPageChange,
  onSizeChange,
  emptyMessage = 'No results found.',
  getRowKey,
  onRowClick,
}: PageableTableProps<T>) {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Box sx={{ display: 'grid', gap: 2.5 }}>
          {title ? (
            <Box>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                {icon}
                <Typography variant="h6">{title}</Typography>
              </Stack>
              {description ? (
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              ) : null}
            </Box>
          ) : null}

          {filters}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.key}>{column.header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length > 0 ? (
                  rows.map((row, index) => (
                    <TableRow
                      key={getRowKey ? getRowKey(row, index) : index}
                      hover
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      sx={onRowClick ? { cursor: 'pointer' } : undefined}
                    >
                      {columns.map((column) => (
                        <TableCell key={column.key}>{column.render(row)}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length}>
                      <Typography variant="body2" color="text.secondary">
                        {emptyMessage}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={(_, nextPage) => onPageChange(nextPage)}
            rowsPerPage={size}
            onRowsPerPageChange={(event) => onSizeChange(Number(event.target.value))}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Box>
      </CardContent>
    </Card>
  )
}
