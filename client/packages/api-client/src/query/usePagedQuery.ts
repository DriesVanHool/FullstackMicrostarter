import { useQuery } from '@tanstack/react-query'

export function usePagedQuery<T>(queryKey: readonly unknown[], queryFn: () => Promise<T>) {
  return useQuery({
    queryKey,
    queryFn,
    placeholderData: (previousData) => previousData,
  })
}
