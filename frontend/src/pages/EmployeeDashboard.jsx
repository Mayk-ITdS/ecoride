import { useEffect, useState } from 'react'
import useAxiosWithAuth from '../hooks/useAxiosWithAuth'
import ReviewCard from '../components/EmployeeDashboard/ReviewCard'
export default function EmployeeDashboard() {
  const api = useAxiosWithAuth()
  const [pending, setPending] = useState([])
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const loadAll = async () => {
    try {
      setLoading(true)
      setError(null)
      const [{ data: p }, { data: i }] = await Promise.all([
        api.get('/reviews/pending'),
        api.get('/employee/incidents'),
      ])
      setPending(p || [])
      setIncidents(i || [])
    } catch (e) {
      setError(e?.response?.data?.error || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const approve = async (r) => {
    try {
      setBusy(true)
      await api.post(`/reviews/${r.id}/approve`)
      setPending((xs) => xs.filter((x) => x.id !== r.id))
    } finally {
      setBusy(false)
    }
  }
  const reject = async (r) => {
    try {
      setBusy(true)
      await api.post(`/reviews/${r.id}/reject`)
      setPending((xs) => xs.filter((x) => x.id !== r.id))
    } catch (e) {
      setError(e?.response?.data?.error || e.message)
    } finally {
      setBusy(false)
    }
  }
  if (loading)
    return <div className="p-6 bg-white rounded-2xl shadow">Chargement…</div>
  if (error)
    return (
      <div className="p-6 bg-white rounded-2xl shadow text-red-600">
        {error}
      </div>
    )

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-4">
        <h3 className="text-lg font-semibold mb-3">Avis en attente</h3>
        {pending.length === 0 ? (
          <div className="text-gray-500">Aucun avis en attente.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-600 border-b">
                  <th className="py-2">#</th>
                  <th className="py-2">Passager</th>
                  <th className="py-2">Chauffeur</th>
                  <th className="py-2">Note</th>
                  <th className="py-2">Commentaire</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((r) => (
                  <ReviewCard
                    key={r.id}
                    r={r}
                    onApprove={approve}
                    onReject={reject}
                    busy={busy}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <h3 className="text-lg font-semibold mb-3">Covoiturages à incidents</h3>
        {incidents.length === 0 ? (
          <div className="text-gray-500">Aucun incident signalé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-600 border-b">
                  <th className="py-2"># Trajet</th>
                  <th className="py-2">Passager</th>
                  <th className="py-2">Chauffeur</th>
                  <th className="py-2">Email passager</th>
                  <th className="py-2">Email chauffeur</th>
                  <th className="py-2">Départ</th>
                  <th className="py-2">Arrivée</th>
                  <th className="py-2">Période</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((x) => (
                  <tr key={x.id_trajet} className="border-b">
                    <td className="py-2">{x.id_trajet}</td>
                    <td className="py-2">{x.passager_pseudo}</td>
                    <td className="py-2">{x.chauffeur_pseudo}</td>
                    <td className="py-2">{x.passager_email}</td>
                    <td className="py-2">{x.chauffeur_email}</td>
                    <td className="py-2">{x.depart_ville}</td>
                    <td className="py-2">{x.arrivee_ville}</td>
                    <td className="py-2 text-sm text-gray-600">
                      {x.depart_ts} → {x.arrivee_ts || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
