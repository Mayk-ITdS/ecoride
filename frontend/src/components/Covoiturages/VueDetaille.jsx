import { useParams, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { useTrajet } from '../../hooks/useTrajet.js'
import ConfirmModal from './ConfirmModal.jsx'

function fmtDate(iso) {
  const d = new Date(iso)
  return isNaN(d)
    ? String(iso ?? '')
    : d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
}
function fmtDur(m) {
  m = Number(m) || 0
  const h = Math.floor(m / 60),
    r = m % 60
  return h ? (r ? `${h}h ${r}m` : `${h}h`) : `${m}m`
}
function fmtPrice(p) {
  const n = Number(p)
  return Number.isFinite(n)
    ? new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'EUR',
      }).format(n)
    : `${p} €`
}

export default function VueDetaille() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: trajet, loading } = useTrajet(id)
  const [showModal, setShowModal] = useState(false)

  const avis = Array.isArray(trajet?.avis) ? trajet.avis : []
  console.log(trajet)
  const moyenneAvis = useMemo(() => {
    if (!avis.length) return "Pas encore d'avis"
    const sum = avis.reduce((acc, a) => acc + (Number(a.note) || 0), 0)
    return (sum / avis.length).toFixed(1)
  }, [avis])

  const dateLabel = useMemo(() => fmtDate(trajet?.date), [trajet?.date])
  const dureeLabel = useMemo(() => fmtDur(trajet?.duree), [trajet?.duree])
  const prixLabel = useMemo(() => fmtPrice(trajet?.prix), [trajet?.prix])

  if (loading)
    return <p className="p-8 text-center text-gray-500">Chargement…</p>
  if (!trajet)
    return (
      <div className="p-8 text-center text-gray-500">
        Ce covoiturage n'existe pas.
      </div>
    )

  const prefs = trajet?.chauffeur?.preferences ?? {}
  const driverName = trajet?.chauffeur?.nom || '—'
  const isEco = !!trajet?.voiture?.eco

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-6">
      <div
        className={`max-w-3xl mx-auto bg-white rounded-2xl shadow p-6 space-y-6
                       ${isEco ? 'ring-2 ring-emerald-300/60 bg-emerald-50/40' : 'ring-1 ring-gray-200/60'}`}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {driverName}
            </h1>
            <p className="text-yellow-500">⭐ {moyenneAvis}</p>
          </div>
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow-sm">
            {prixLabel}
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 text-gray-700">
          <p>
            <span className="font-semibold">Trajet :</span> {trajet.depart} →{' '}
            {trajet.arrivee}
          </p>
          <p>
            <span className="font-semibold">Date :</span> {dateLabel}
          </p>
          <p>
            <span className="font-semibold">Durée estimée :</span> {dureeLabel}
          </p>
          <p>
            <span className="font-semibold">Places disponibles :</span>{' '}
            {Number(trajet.places) || 0}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Véhicule</h3>
          <div className="grid sm:grid-cols-2 gap-2 text-gray-700">
            <p>
              Marque / Modèle :{' '}
              <span className="font-medium">
                {trajet.voiture.marque} {trajet.voiture.modele}
              </span>
            </p>
            <p>
              Immatriculation :{' '}
              <span className="font-medium">
                {trajet.voiture.immatriculation}
              </span>
            </p>
            <p>
              Couleur :{' '}
              <span className="font-medium">{trajet.voiture.couleur}</span>
            </p>
            <p>
              Type :{' '}
              <span className="font-medium">
                {isEco ? 'Électrique / Éco' : 'Thermique classique'}
              </span>
            </p>
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">
            Préférences chauffeur
          </h3>
          <ul className="list-disc pl-5 text-gray-700">
            <li>🚭 {prefs.fumeur ? 'Fumeur' : 'Non fumeur'}</li>
            <li>
              🐶{' '}
              {(prefs.animaux ?? prefs.pets)
                ? 'Animaux acceptés'
                : "Pas d'animaux"}
            </li>
            <li>
              🎵{' '}
              {(prefs.musique ?? prefs.music) ? 'Musique OK' : 'Pas de musique'}
            </li>
          </ul>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Avis passagers</h3>
          {avis.length === 0 ? (
            <p className="text-gray-500 text-sm">Pas encore d’avis.</p>
          ) : (
            <div className="space-y-3">
              {avis.map((a, j) => (
                <div key={j} className="border-b pb-2">
                  <p className="text-sm font-semibold">
                    {a.author || 'Anonyme'}
                  </p>
                  <p className="text-yellow-500 text-sm">
                    ⭐ {Number(a.note || 0).toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-700">{a.commentaire}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Retour
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Participer
          </button>
        </div>

        <ConfirmModal
          open={showModal}
          onClose={() => setShowModal(false)}
          trajet={trajet}
          onConfirm={() => {
            setShowModal(false)
          }}
        />
      </div>
    </div>
  )
}
