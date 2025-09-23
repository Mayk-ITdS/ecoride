import { useEffect, useState } from 'react'
import useAxiosWithAuth from './useAxiosWithAuth'

export default function useDashboardTrajets({ pollMs = 0 } = {}) {
  const api = useAxiosWithAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchOnce = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/trajets/mine')
      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      setError(e)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchOnce()
  }, [])

  useEffect(() => {
    if (!pollMs) return
    const id = setInterval(fetchOnce, pollMs)
    return () => clearInterval(id)
  }, [pollMs])

  return { rows, loading, error, refetch: fetchOnce }
}
