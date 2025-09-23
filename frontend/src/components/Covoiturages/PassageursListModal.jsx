import { useEffect, useState } from 'react'
import ConfirmPassageursModal from './ConfirmPassageursModal'

const statusClass = (s) => {
  const m = {
    en_attente: 'bg-amber-100 text-amber-700',
    confirmé: 'bg-emerald-100 text-emerald-700',
    refusé: 'bg-red-100 text-red-600',
    annulé: 'bg-gray-100 text-gray-500',
    en_cours: 'bg-blue-100 text-blue-700',
    terminé: 'bg-gray-100 text-gray-600',
  }
  return `px-2 py-0.5 rounded-lg text-xs capitalize ${m[s] ?? 'bg-gray-100 text-gray-600'}`
}

export default function PassageursListModal({
  open,
  tripId,
  api,
  onClose,
  onChanged,
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [rows, setRows] = useState([])
  const [confirm, setConfirm] = useState(null)
  const [busy, setBusy] = useState(false)

  const loadPassengers = async () => {
    if (!tripId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/trajets/${tripId}/passagers`)
      setRows(data ?? [])
    } catch (e) {
      setError(
        e?.response?.data?.error || 'Impossible de charger les passagers.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && tripId) loadPassengers()
  }, [open, tripId])
  const doAction = async () => {
    if (!confirm) return
    try {
      setBusy(true)
      const { row, type } = confirm
      const newStatus = type === 'confirmer' ? 'confirmé' : 'refusé'

      await api.patch(`/participations/${row.id_participation}/status`, {
        status: newStatus,
      })
      setRows((xs) =>
        xs.map((x) =>
          x.id_participation === row.id_participation
            ? { ...x, status: newStatus }
            : x,
        ),
      )

      onChanged?.()
      setConfirm(null)
    } catch (e) {
      setError(e?.response?.data?.error || 'Échec de la mise à jour du statut.')
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-11/12 max-w-[680px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Passagers du trajet #{tripId}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-gray-500">Chargement…</div>
        ) : rows.length === 0 ? (
          <div className="py-8 text-center text-gray-500">Aucune demande.</div>
        ) : (
          <ul className="divide-y">
            {rows.map((p) => {
              const s = (p.status || 'en_attente').toLowerCase()
              return (
                <li
                  key={p.id_participation}
                  className="py-3 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{p.pseudo}</div>
                    <div className="mt-1">
                      <span className={statusClass(s)}>{s}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 rounded-lg text-sm bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-60"
                      disabled={loading || s === 'confirmé'}
                      onClick={() => setConfirm({ type: 'confirmer', row: p })}
                    >
                      Confirmer
                    </button>
                    <button
                      className="px-3 py-1 rounded-lg text-sm bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-60"
                      disabled={loading || s === 'refusé'}
                      onClick={() => setConfirm({ type: 'refuser', row: p })}
                    >
                      Refuser
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <div className="mt-5 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Fermer
          </button>
        </div>
      </div>
      <ConfirmPassageursModal
        open={!!confirm}
        title={
          confirm?.type === 'confirmer'
            ? 'Confirmer le passager'
            : 'Refuser le passager'
        }
        message={
          confirm
            ? `Voulez-vous vraiment ${confirm.type === 'confirmer' ? 'confirmer' : 'refuser'} la participation de « ${confirm.row.pseudo} » ?`
            : ''
        }
        confirmLabel={confirm?.type === 'confirmer' ? 'Confirmer' : 'Refuser'}
        cancelLabel="Annuler"
        danger={confirm?.type === 'refuser'}
        busy={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={doAction}
      />
    </div>
  )
}
