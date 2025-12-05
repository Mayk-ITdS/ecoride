import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Users, Euro, Leaf } from 'lucide-react'

function formatDate(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso ?? '')
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(mins) {
  const m = Number(mins) || 0
  const h = Math.floor(m / 60)
  const r = m % 60
  return h ? (r ? `${h}h ${r}m` : `${h}h`) : `${m}m`
}

function formatPrice(p) {
  const n = Number(p)
  if (Number.isFinite(n)) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'EUR',
      }).format(n)
    } catch {}
    return `${n.toFixed(2)} €`
  }
  return `${p} €`
}

function initials(name = '') {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('') || '?'
  )
}

/**
 * @param {{ trajet: {
 *   id: number|string,
 *   depart: string, arrivee: string, date: string,
 *   duree: number, places: number, prix: number|string,
 *   chauffeur?: { id?: number, nom?: string, avatar?: string, preferences?: any },
 *   voiture?: { eco?: boolean },
 *   avis?: Array<{ author?: string, note?: number, commentaire?: string }>
 * }, onParticiper?: (t:any)=>void }} props
 */
export default function RideCard({ trajet, onParticiper }) {
  const driverName = trajet?.chauffeur?.nom || '—'
  const avatarSrc = trajet?.chauffeur?.avatar || ''
  const isEco = !!trajet?.voiture?.eco
  const avis = Array.isArray(trajet?.avis) ? trajet.avis : []

  const moyenneAvis = useMemo(() => {
    if (!avis.length) return null
    const sum = avis.reduce((a, b) => a + (Number(b.note) || 0), 0)
    return (sum / avis.length).toFixed(1)
  }, [avis])

  const topAvis = avis.slice(0, 2)

  return (
    <div
      className={`rounded-xl p-4 flex flex-col justify-between transition shadow bg-white
        ${isEco ? 'ring-2 ring-emerald-300/60' : 'ring-1 ring-gray-200/60'}
        hover:shadow-md`}
      aria-label={`Trajet ${trajet?.depart ?? ''} vers ${trajet?.arrivee ?? ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={driverName}
              className="w-12 h-12 rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            <div
              aria-hidden
              className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700
                         flex items-center justify-center font-semibold"
            >
              {initials(driverName)}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-700">{driverName}</p>
            <p className="text-sm text-yellow-500">
              {moyenneAvis ? <>⭐ {moyenneAvis}</> : 'Pas encore d’avis'}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
            ${isEco ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
          title={isEco ? 'Véhicule électrique/éco' : 'Véhicule thermique'}
        >
          <Leaf className="w-3 h-3" aria-hidden />
          {isEco ? 'Éco' : 'Thermique'}
        </span>
      </div>

      <div className="space-y-1 mb-3 text-sm text-gray-700">
        <p>
          🚗 {trajet?.depart} → {trajet?.arrivee}
        </p>
        <p className="flex items-center gap-1">
          <Calendar className="w-4 h-4" aria-hidden />{' '}
          {formatDate(trajet?.date)}
        </p>
        <p className="flex items-center gap-1">
          <Clock className="w-4 h-4" aria-hidden /> Durée estimée :{' '}
          {formatDuration(trajet?.duree)}
        </p>
        <p className="flex items-center gap-1">
          <Users className="w-4 h-4" aria-hidden />{' '}
          {Number(trajet?.places) || 0} places
        </p>
        <p className="flex items-center gap-1">
          <Euro className="w-4 h-4" aria-hidden /> Prix :{' '}
          {formatPrice(trajet?.prix)}
        </p>
      </div>

      <div className="mt-2 border-t pt-2">
        <h4 className="text-xs font-semibold text-gray-600 mb-1">
          Avis passagers
        </h4>
        {avis.length === 0 ? (
          <p className="text-xs text-gray-400">Pas encore d’avis.</p>
        ) : (
          <div className="space-y-1">
            {topAvis.map((a, i) => (
              <div key={i} className="text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">
                    {a.author || 'Anonyme'}
                  </span>
                  <span className="text-yellow-500">
                    ⭐ {Number(a.note || 0).toFixed(1)}
                  </span>
                </div>

                <p className="text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">
                  {a.commentaire}
                </p>
              </div>
            ))}
            {avis.length > 2 && (
              <Link
                to={`/covoiturage/${trajet.id}`}
                className="text-[11px] text-emerald-700 hover:underline"
              >
                Voir tous les avis ({avis.length})
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-3">
        <button
          type="button"
          onClick={() => onParticiper?.(trajet)}
          className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm hover:bg-emerald-200"
        >
          Participer
        </button>
        <Link
          to={`/covoiturage/${trajet.id}`}
          className="px-3 py-1 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
        >
          Détails
        </Link>
      </div>
    </div>
  )
}
