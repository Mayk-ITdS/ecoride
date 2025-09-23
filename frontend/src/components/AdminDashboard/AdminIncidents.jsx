import { useEffect, useMemo, useState } from 'react'
import useAxiosWithAuth from '../../hooks/useAxiosWithAuth'

export default function AdminIncidents() {
  const api = useAxiosWithAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [q, setQ] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/admin/incidents', {
        params: { page, limit, q },
      })
      setItems(Array.isArray(data) ? data : [])
      setErr(null)
    } catch (e) {
      setErr(e?.response?.data?.error || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [page, limit, q])

  const filtered = useMemo(() => {
    if (!status) return items
    return items.filter((i) => (i.status ?? '').toLowerCase() === status)
  }, [items, status])

  const pages = useMemo(
    () => Math.max(Math.ceil(filtered.length / limit), 1),
    [filtered, limit],
  )
  const visible = useMemo(
    () => filtered.slice((page - 1) * limit, page * limit),
    [filtered, page, limit],
  )

  if (loading)
    return <div className="p-6 bg-white rounded-2xl shadow">Chargement…</div>
  if (err)
    return (
      <div className="p-6 bg-white rounded-2xl shadow text-red-600">{err}</div>
    )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-semibold">Incidents</h2>
        <select
          value={status}
          onChange={(e) => {
            setPage(1)
            setStatus(e.target.value)
          }}
          className="border rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
        >
          <option value="">Tous les statuts</option>
          <option value="open">Ouvert</option>
          <option value="closed">Fermé</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-gray-600 border-b">
              <th className="py-2 pr-3">ID</th>
              <th className="py-2 pr-3">Type</th>
              <th className="py-2 pr-3">Description</th>
              <th className="py-2 pr-3">Statut</th>
              <th className="py-2 pr-3">Créé</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((i) => (
              <tr key={i.id} className="border-b align-top">
                <td className="py-2 pr-3">{i.id}</td>
                <td className="py-2 pr-3">{i.type ?? '-'}</td>
                <td
                  className="py-2 pr-3 max-w-[40ch] truncate"
                  title={i.description}
                >
                  {i.description}
                </td>
                <td className="py-2 pr-3">
                  <span
                    className={`px-2 py-1 text-xs rounded ${String(i.status).toLowerCase() === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}
                  >
                    {i.status ?? '-'}
                  </span>
                </td>
                <td className="py-2 pr-3">
                  {i.created_at ? new Date(i.created_at).toLocaleString() : '-'}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan="5" className="py-6 text-center text-gray-500">
                  Aucun incident.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Page {page} / {pages} — {filtered.length} incidents
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
