import { useEffect, useMemo, useState } from 'react'
import useAxiosWithAuth from '../../hooks/useAxiosWithAuth'
import CreateEmployeeModal from '../../components/AdminDashboard/CreateEmployeeModal.jsx'

export default function AdminEmployees() {
  const api = useAxiosWithAuth()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/admin/users', {
        params: { page, limit, q, role: 'employee' },
      })
      setItems(data.items ?? [])
      setTotal(data.total ?? 0)
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

  const pages = useMemo(
    () => Math.max(Math.ceil(total / limit), 1),
    [total, limit],
  )
  const stop = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const prevPage = (e) => {
    stop(e)
    setPage((p) => Math.max(1, p - 1))
  }
  const nextPage = (e) => {
    stop(e)
    setPage((p) => Math.min(pages, p + 1))
  }
  const suspend = async (u, suspended) => {
    await api.patch(`/admin/users/${u.id_user}/suspend`, { suspended })
    await load()
  }

  if (loading)
    return <div className="p-6 bg-white rounded-2xl shadow">Chargement…</div>
  if (err)
    return (
      <div className="p-6 bg-white rounded-2xl shadow text-red-600">{err}</div>
    )

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-xl font-semibold">Employés</h2>
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => {
              setPage(1)
              setQ(e.target.value)
            }}
            placeholder="Rechercher pseudo/email…"
            className="border rounded-lg px-3 py-2 text-sm w-full md:w-72"
          />
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Créer un employé
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-gray-600 border-b">
              <th className="py-2 pr-3">ID</th>
              <th className="py-2 pr-3">Pseudo</th>
              <th className="py-2 pr-3">Email</th>
              <th className="py-2 pr-3">Rôles</th>
              <th className="py-2 pr-3">Statut</th>
              <th className="py-2 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id_user} className="border-b">
                <td className="py-2 pr-3">{u.id_user}</td>
                <td className="py-2 pr-3">{u.pseudo}</td>
                <td className="py-2 pr-3">{u.email}</td>
                <td className="py-2 pr-3 text-sm text-gray-600">
                  {(u.roles || []).join(', ')}
                </td>
                <td className="py-2 pr-3">
                  {u.is_suspended ? (
                    <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
                      suspendu
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700">
                      actif
                    </span>
                  )}
                </td>
                <td className="py-2 pr-3">
                  {u.is_suspended ? (
                    <button
                      onClick={() => suspend(u, false)}
                      className="px-3 py-1 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Réactiver
                    </button>
                  ) : (
                    <button
                      onClick={() => suspend(u, true)}
                      className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Suspendre
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="6" className="py-6 text-center text-gray-500">
                  Aucun employé trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Page {page} / {pages} — {total} employés
          </div>
          <div className="flex gap-2">
            <button
              onClick={prevPage}
              disabled={page <= 1}
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              onClick={nextPage}
              disabled={page >= pages}
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      <CreateEmployeeModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={load}
      />
    </div>
  )
}
