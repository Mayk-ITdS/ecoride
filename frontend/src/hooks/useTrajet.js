import { useEffect, useState, useCallback } from 'react'
import useAxiosWithAuth from '../hooks/useAxiosWithAuth'

export function useTrajet(id, { enabled = true } = {}) {
  const api = useAxiosWithAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchOnce = useCallback(
    async (controller) => {
      if (!enabled || !id) return
      setLoading(true)
      setError(null)
      setData(null)
      try {
        const res = await api.get(`/trajets/${id}`, {
          signal: controller.signal,
        })
        setData(Array.isArray(res.data) ? (res.data[0] ?? null) : res.data)
      } catch (e) {
        if (e.name !== 'CanceledError' && e.name !== 'AbortError') setError(e)
      } finally {
        setLoading(false)
      }
    },
    [api, id, enabled],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchOnce(controller)
    return () => controller.abort()
  }, [fetchOnce])

  return { data, loading, error: error }
}
