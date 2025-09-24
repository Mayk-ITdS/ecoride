import { useState, useEffect, useMemo, useCallback } from 'react'
import useAxiosWithAuth from '../../hooks/useAxiosWithAuth'
import useAuthorization from '../../hooks/useAuthorization'
import Badge from '../../helpers/statusBadges'
import PassageursListModal from '../Covoiturages/PassageursListModal'

const SortIcon = ({ active, direction }) => (
  <span className="ml-1 text-gray-400">
    {active ? (direction === 'asc' ? '︿' : '﹀') : '﹀'}
  </span>
)

export default function DataTable() {
  const api = useAxiosWithAuth()
  const { user } = useAuthorization()

  const [selectedTrajet, setSelectedTrajet] = useState(null)
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'asc',
  })
  const [rows, setRows] = useState([])
  const [roleFilter, setRoleFilter] = useState(null)
  const [statusFilter, setStatusFilter] = useState(null)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState({ id: null, action: null })
  const [page, setPage] = useState(1)
  const [manageTripId, setManageTripId] = useState(null)

  const userId = user?.id_user
  const pageSize = 3

  const reload = useCallback(async () => {
    const { data } = await api.get(`/trajets/mine`)
    const mapped = data.map((t) => {
      const rawStatus = (t.statut ?? t.status ?? 'en_attente')?.toLowerCase()
      const roleDisplay =
        t.role_dans_trajet === 'chauffeur' ? 'Chauffeur' : 'Passager'
      const roleValue =
        t.role_dans_trajet === 'chauffeur' ? 'chauffeur' : 'passager'
      return {
        id: t.id_trajet,
        trajet: `${t.depart_ville} → ${t.arrivee_ville}`,
        date: t.depart_ts?.slice(0, 10) ?? '',
        roleDisplay,
        roleValue,
        status: rawStatus,
        solde: roleValue === 'chauffeur' ? Number(t.prix) : -Number(t.prix),
      }
    })
    setRows(mapped)
  }, [api])

  const startTrip = async (id) => {
    try {
      setBusy({ id, action: 'start' })
      await api.patch(`/trajets/${id}/demarrer`)
      await reload()
    } finally {
      setBusy({ id: null, action: null })
    }
  }
  const finishTrip = async (id) => {
    try {
      setBusy({ id, action: 'finish' })
      await api.patch(`/trajets/${id}/terminer`)
      await reload()
    } finally {
      setBusy({ id: null, action: null })
    }
  }
  const cancelTrip = async (id) => {
    try {
      setBusy({ id, action: 'cancel' })
      await api.patch(`/trajets/${id}/annuler`)
      await reload()
    } finally {
      setBusy({ id: null, action: null })
    }
  }
  const openPassengersManager = async (tripId) => {
    try {
      setBusy({ id: tripId, action: 'load' })
      setManageTripId(tripId)
    } finally {
      setBusy({ id: null, action: null })
    }
  }

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        await reload()
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId, reload])

  const sortedData = useMemo(() => {
    const copy = [...rows]
    const dir = sortConfig.direction === 'asc' ? 1 : -1
    copy.sort((a, b) =>
      a[sortConfig.key] < b[sortConfig.key]
        ? -1 * dir
        : a[sortConfig.key] > b[sortConfig.key]
          ? 1 * dir
          : 0,
    )
    return copy
  }, [rows, sortConfig])

  const filteredData = useMemo(
    () =>
      sortedData.filter(
        (t) =>
          (roleFilter ? t.roleDisplay === roleFilter : true) &&
          (statusFilter ? t.status === statusFilter : true),
      ),
    [sortedData, roleFilter, statusFilter],
  )

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1
  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize,
  )

  const requestSort = (key) =>
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))

  const btnClass = (variant, disabled) => {
    const base = 'px-3 py-1 rounded-lg text-sm transition'
    const variants = {
      primary: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
      info: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      danger: 'bg-red-100 text-red-600 hover:bg-red-200',
      muted: 'bg-gray-100 text-gray-400',
    }
    const dis = disabled
      ? ' opacity-60 cursor-not-allowed pointer-events-none'
      : ''
    return `${base} ${variants[variant]}${dis}`
  }

  const getActionsForRow = (row) => {
    const isChauffeur = row.roleValue === 'chauffeur'
    const s = row.status || ''
    const isBusy = busy.id === row.id

    if (isChauffeur) {
      if (s === 'en_attente' || s === 'confirmé') {
        return [
          {
            key: 'start',
            label: isBusy && busy.action === 'start' ? '…' : 'Démarrer',
            onClick: () => startTrip(row.id),
            variant: 'primary',
            disabled: isBusy,
          },
          {
            key: 'cancel',
            label: isBusy && busy.action === 'cancel' ? '…' : 'Annuler',
            onClick: () => cancelTrip(row.id),
            variant: 'danger',
            disabled: isBusy,
          },
        ]
      }
      if (s === 'en_cours') {
        return [
          {
            key: 'finish',
            label:
              isBusy && busy.action === 'finish'
                ? '…'
                : 'Arrivé à la destination',
            onClick: () => finishTrip(row.id),
            variant: 'info',
            disabled: isBusy,
          },
        ]
      }
      return [
        {
          key: 'muted',
          label: s === 'terminé' ? 'Terminé' : 'Annulé',
          onClick: null,
          variant: 'muted',
          disabled: true,
        },
      ]
    }
    if (s === 'terminé' || s === 'annulé') {
      return [
        {
          key: 'muted',
          label: s === 'terminé' ? 'Terminé' : 'Annulé',
          onClick: null,
          variant: 'muted',
          disabled: true,
        },
      ]
    }
    return [
      {
        key: 'details',
        label: '—',
        onClick: null,
        variant: 'muted',
        disabled: true,
      },
    ]
  }

  if (loading)
    return <div className="bg-white shadow rounded-2xl p-6">Chargement…</div>

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Historique des trajets
        </h2>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-emerald-50"
            onClick={() =>
              setRoleFilter(roleFilter === null ? 'Chauffeur' : null)
            }
          >
            Filtrer rôle {roleFilter && `: ${roleFilter}`}
          </button>
          <button
            className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-emerald-50"
            onClick={() =>
              setStatusFilter(statusFilter === null ? 'en_attente' : null)
            }
          >
            Filtrer statut {statusFilter && `: ${statusFilter}`}
          </button>
        </div>
      </div>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-600 text-sm border-b">
              <th
                className="py-2 w-40 cursor-pointer"
                onClick={() => requestSort('trajet')}
              >
                Trajet{' '}
                <SortIcon
                  active={sortConfig.key === 'trajet'}
                  direction={sortConfig.direction}
                />
              </th>
              <th
                className="py-2 w-32 cursor-pointer"
                onClick={() => requestSort('date')}
              >
                Date{' '}
                <SortIcon
                  active={sortConfig.key === 'date'}
                  direction={sortConfig.direction}
                />
              </th>
              <th className="py-2 w-28">Rôle</th>
              <th className="py-2 w-28">Statut</th>
              <th
                className="py-2 w-24 cursor-pointer"
                onClick={() => requestSort('solde')}
              >
                Solde (€){' '}
                <SortIcon
                  active={sortConfig.key === 'solde'}
                  direction={sortConfig.direction}
                />
              </th>
              <th className="py-2 w-28">Détails</th>
              <th className="py-2 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((v) => (
              <tr key={v.id} className="border-b last:border-0">
                <td className="py-2 truncate">{v.trajet}</td>
                <td className="py-2">{v.date}</td>
                <td className="py-2">{v.roleDisplay}</td>
                <td className="py-2">
                  <Badge status={v.status} />
                </td>
                <td className="py-2">{v.solde}€</td>
                <td className="py-2">
                  <button
                    className="px-3 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
                    onClick={() => setSelectedTrajet(v)}
                  >
                    Détails
                  </button>
                </td>
                <td className="py-2 space-x-2">
                  {v.roleValue === 'chauffeur' &&
                    ['en_attente', 'confirmé'].includes(v.status) && (
                      <button
                        className={btnClass(
                          'info',
                          busy.id === v.id && busy.action === 'load',
                        )}
                        onClick={() => openPassengersManager(v.id)}
                        disabled={busy.id === v.id && busy.action === 'load'}
                      >
                        {busy.id === v.id && busy.action === 'load'
                          ? '…'
                          : 'Gérer passagers'}
                      </button>
                    )}
                  {getActionsForRow(v).map((a) => (
                    <button
                      key={a.key}
                      className={btnClass(a.variant, a.disabled)}
                      onClick={a.onClick || undefined}
                      disabled={a.disabled}
                    >
                      {a.label}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="block md:hidden space-y-4 mt-6">
        {paginatedData.map((v) => (
          <div
            key={v.id}
            className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white"
          >
            <h3 className="font-semibold text-gray-800">{v.trajet}</h3>
            <p className="text-sm text-gray-500">Date : {v.date}</p>
            <p className="text-sm text-gray-500">Rôle : {v.roleDisplay}</p>
            <p className="text-sm text-gray-500">
              Statut : <Badge status={v.status} />
            </p>
            <p className="text-sm text-gray-500">Solde : {v.solde}€</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                className="px-3 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
                onClick={() => setSelectedTrajet(v)}
              >
                Détails
              </button>
              {getActionsForRow(v).map((a) => (
                <button
                  key={a.key}
                  className={btnClass(a.variant, a.disabled)}
                  onClick={a.onClick || undefined}
                  disabled={a.disabled}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedTrajet && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 shadow-lg w-11/12 md:w-1/2">
            <h3 className="text-lg font-semibold mb-4">
              Détails du trajet : {selectedTrajet.trajet}
            </h3>
            <p>Statut : {selectedTrajet.status}</p>
            <p>Date : {selectedTrajet.date}</p>
            <p>Rôle : {selectedTrajet.roleDisplay}</p>
            <p>Solde : {selectedTrajet.solde}€</p>
            <button
              className="mt-4 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
              onClick={() => setSelectedTrajet(null)}
            >
              Retour
            </button>
          </div>
        </div>
      )}

      <PassageursListModal
        open={!!manageTripId}
        tripId={manageTripId}
        api={api}
        onClose={() => setManageTripId(null)}
        onChanged={reload}
      />

      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <span>
          Page {page} sur {totalPages}
        </span>
        <div className="space-x-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            ⬅️
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            ➡️
          </button>
        </div>
      </div>
    </div>
  )
}
