import { useEffect, useMemo, useState } from 'react'
import useAxiosWithAuth from '../../hooks/useAxiosWithAuth'

export default function AdminReviews() {
  const api = useAxiosWithAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const load = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/employee/reviews/pending')
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
  }, [])

  const approve = async (id) => {
    await api.patch(`/employee/reviews/${id}/approve`)
    await load()
  }
  const reject = async (id) => {
    await api.patch(`/employee/reviews/${id}/reject`)
    await load()
  }

  const pages = useMemo(
    () => Math.max(Math.ceil(items.length / limit), 1),
    [items, limit],
  )
  const visible = useMemo(
    () => items.slice((page - 1) * limit, page * limit),
    [items, page, limit],
  )

  if (loading)
    return <div className="p-6 bg-white rounded-2xl shadow">Chargement…</div>
  if (err)
    return (
      <div className="p-6 bg-white rounded-2xl shadow text-red-600">{err}</div>
    )

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Avis en attente</h2>
      <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-gray-600 border-b">
              <th className="py-2 pr-3">ID</th>
              <th className="py-2 pr-3">Auteur</th>
              <th className="py-2 pr-3">Cible</th>
              <th className="py-2 pr-3">Note</th>
              <th className="py-2 pr-3">Commentaire</th>
              <th className="py-2 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="border-b align-top">
                <td className="py-2 pr-3">{r.id}</td>
                <td className="py-2 pr-3">{r.author ?? r.auteur ?? '-'}</td>
                <td className="py-2 pr-3">{r.target ?? r.cible ?? '-'}</td>
                <td className="py-2 pr-3">{r.note}</td>
                <td
                  className="py-2 pr-3 max-w-[28ch] truncate"
                  title={r.commentaire}
                >
                  {r.commentaire}
                </td>
                <td className="py-2 pr-3 flex gap-2">
                  <button
                    onClick={() => approve(r.id)}
                    className="px-3 py-1 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => reject(r.id)}
                    className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Rejeter
                  </button>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan="6" className="py-6 text-center text-gray-500">
                  Aucun avis en attente.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Page {page} / {pages} — {items.length} avis
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Précédent
            </button>
            <button
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
