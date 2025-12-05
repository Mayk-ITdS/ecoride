import { useEffect, useState } from 'react'
import useAxiosWithAuth from '../../hooks/useAxiosWithAuth'
import AjouterVoitureModal from './AjouterUneVoitureModal'
export default function VoituresModal({ isOpen, onClose, userId, role }) {
  const [voitures, setVoitures] = useState([])
  const [loading, setLoading] = useState(false)
  const [isAddCarOpen, setAddCarOpen] = useState(false)
  const api = useAxiosWithAuth()

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const res = await api.get(`/voitures/user/${userId}`)
        if (!cancelled) setVoitures(Array.isArray(res.data) ? res.data : [])
      } catch (e) {
        console.error('Erreur voitures:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [api, userId, isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.()
  }
  const brandEmoji = (marque) => {
    if (!marque) return '🚗'
    const m = marque.toLowerCase()
    if (m.includes('tesla')) return '⚡🚗'
    if (m.includes('renault')) return '🟡🚗'
    if (m.includes('peugeot')) return '🦁🚗'
    if (m.includes('bmw')) return '🔷🚗'
    return '🚗'
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="voitures-title"
    >
      <div
        className="relative w-full max-w-xl rounded-2xl bg-white/90 shadow-2xl ring-1 ring-black/5 
                   transition-all duration-200 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out
                   data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
        data-state="open"
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full 
                     text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Fermer"
        >
          ✕
        </button>
        <div className="flex items-center gap-3 border-b px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            🚙
          </div>
          <div>
            <h2
              id="voitures-title"
              className="text-lg font-semibold text-gray-900"
            >
              Mes voitures
            </h2>
            <p className="text-sm text-gray-500">
              Gérez vos véhicules enregistrés
            </p>
          </div>
        </div>
        <div className="px-5 py-4 max-h-[65vh] overflow-y-auto">
          {loading ? (
            <div className="py-10 text-center text-gray-500">Chargement…</div>
          ) : voitures.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-gray-600">
                Vous n’avez encore aucun véhicule.
              </p>
              <p className="text-sm text-gray-500">Ajouter une voiture</p>
            </div>
          ) : (
            <ul className="grid gap-3">
              {voitures.map((v) => (
                <li
                  key={v.id_voiture}
                  className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {v.marque}
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                          {brandEmoji(v.marque)}
                        </div>{' '}
                        {v.modele}{' '}
                        <span className="ml-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          {v.immatriculation}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {v.nb_places} Places •{' '}
                        {v.is_electric ? 'Électrique ⚡' : 'Thermique ⛽'}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white shadow rounded-2xl p-4"></div>

        {role !== 'passager' && (
          <div className="bg-white shadow rounded-2xl p-4">
            <button
              className="text-md text-center w-full py-4 rounded-2 px-8 border-4 bg-ecoGreen"
              onClick={() => setAddCarOpen(true)}
            >
              Ajouter une voiture
            </button>
          </div>
        )}
        <AjouterVoitureModal
          isOpen={isAddCarOpen}
          onClose={() => setAddCarOpen(false)}
          userId={userId}
          onAdded={() => {}}
        />
      </div>
    </div>
  )
}
