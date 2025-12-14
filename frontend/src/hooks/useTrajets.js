import { useEffect, useMemo, useState } from 'react'
import { buildTrajetsQuery } from '../helpers/buildTrajeetQuery'
import useAxiosWithAuth from './useAxiosWithAuth'
export function useTrajets(filters = {}, options = { enabled: false }) {
  const { enabled = false } = options
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const api = useAxiosWithAuth()
  const qs = useMemo(() => buildTrajetsQuery(filters), [filters])

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    setLoading(true)
    ;(async () => {
      try {
        const res = await api.get(`/trajets?${qs}`, {
          signal: controller.signal,
        })
        setData(res.data)
      } catch (e) {
        if (e.code === 'ERR_CANCELED') return
        console.error('useTrajets fetch error:', e)
      } finally {
        setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [enabled, qs, api])

  return { data, loading }
}
