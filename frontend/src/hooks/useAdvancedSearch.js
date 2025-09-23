import { useMemo } from 'react'
import { useTrajets } from './useTrajets'

export default function useAdvancedSearch(filters, options) {
  const { data = [], loading, error } = useTrajets(filters, options)
  const results = useMemo(() => data, [data])
  return { data: results, loading, error }
}
