import { useState } from 'react'
import useAxiosWithAuth from '../../hooks/useAxiosWithAuth'
export default function ProposerTrajetModal({ isOpen, onClose }) {
  const [showNewCarForm, setShowNewCarForm] = useState(false)
  const { user } = useAuthorization()
  const [successModal, setSuccessModal] = useState(false)
  const api = useAxiosWithAuth()
  const [formData, setFormData] = useState({
    departLocal: '',
    depart: '',
    arrivee: '',
    depart_ts: '',
    duree: '',
    prix: '',
    places: '',
    voitureId: '',
    newCar: {
      marque: '',
      modele: '',
      plaque: '',
      dateImmat: '',
      places: '',
      electrique: false,
    },
    preferences: { fumeur: 'non-fumeur', animaux: 'pas-animal' },
  })
  const userCars = [
    { id: 1, marque: 'Tesla', modele: 'Model 3', places: 4 },
    { id: 2, marque: 'Renault', modele: 'Clio', places: 5 },
  ]
  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await api.patch('/users/preferences', {
        fumeur: formData.preferences.fumeur === 'fumeur',
        animaux: formData.preferences.animaux === 'animal',
      })
    } catch (err) {
      console.warn('Preferences update failed:', err.response?.data || err)
    }
    const departDate = new Date(formData.departLocal)
    if (Number.isNaN(departDate.getTime())) {
      alert('Nieprawidłowa data')
      return
    }
    const dureeMin = Number(formData.duree) || 0
    const arriveeDate = new Date(departDate.getTime() + dureeMin * 60 * 1000)

    const trajetData = {
      depart: formData.depart?.trim(),
      arrivee: formData.arrivee.trim(),
      depart_ts: departDate.toISOString(),
      arrivee_ts: arriveeDate.toISOString(),
      duree: Number(formData.duree) || 0,
      prix: Number(formData.prix),
      places: Number(formData.places) || 0,
      chauffeur: { id: user?.id_user ?? user?.id },
      voiture: {
        id_voiture: formData.voitureId ? Number(formData.voitureId) : null,
      },
    }
    await api.post('/trajets', trajetData)
    setSuccessModal(true)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-11/12 md:w-2/3 lg:w-1/2 p-6 max-h-[90vh] overflow-y-auto ring-1 ring-black/5">
        <h2 className="text-xl font-bold text-emerald-700 mb-4">
          🚗 Proposer un trajet
        </h2>
        {successModal ? (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <h3 className="text-lg font-bold text-emerald-700">
                Trajet créé avec succès !
              </h3>
              <p className="text-gray-600 mt-2">
                Votre proposition a été enregistrée.
              </p>
              <button
                onClick={() => {
                  setSuccessModal(false)
                  onClose()
                }}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                OK
              </button>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="depart" className="block text-sm font-medium">
                  Départ
                </label>
                <input
                  id="depart"
                  name="depart"
                  value={formData.depart}
                  onChange={handleChange}
                  type="text"
                  placeholder="Adresse de départ"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-4 focus:ring-emerald-300/30"
                />
              </div>
              <div>
                <label htmlFor="arrivee" className="block text-sm font-medium">
                  Arrivée
                </label>
                <input
                  id="arrivee"
                  name="arrivee"
                  value={formData.arrivee}
                  onChange={handleChange}
                  type="text"
                  placeholder="Adresse d’arrivée"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-4 focus:ring-emerald-300/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="depart_ts"
                  className="block text-sm font-medium"
                >
                  Heure de départ
                </label>
                <input
                  id="depart_ts"
                  name="depart_ts"
                  value={formData.departLocal}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, departLocal: e.target.value }))
                  }
                  type="datetime-local"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-4 focus:ring-emerald-300/30"
                />
              </div>
              <div>
                <label htmlFor="duree" className="block text-sm font-medium">
                  Durée estimée (minutes)
                </label>
                <input
                  id="duree"
                  name="duree"
                  value={formData.duree}
                  onChange={handleChange}
                  type="number"
                  placeholder="Ex: 90"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-4 focus:ring-emerald-300/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prix" className="block text-sm font-medium">
                  Prix (€)
                </label>
                <input
                  id="prix"
                  name="prix"
                  value={formData.prix}
                  onChange={handleChange}
                  type="number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-4 focus:ring-emerald-300/30"
                />
              </div>
              <div>
                <label htmlFor="places" className="block text-sm font-medium">
                  Places disponibles
                </label>
                <input
                  id="places"
                  name="places"
                  value={formData.places}
                  onChange={handleChange}
                  type="number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-4 focus:ring-emerald-300/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Choisir un véhicule
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={formData.voitureId}
                  onChange={(e) =>
                    setFormData({ ...formData, voitureId: e.target.value })
                  }
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-4 focus:ring-emerald-300/30"
                >
                  <option value="">-- Sélectionner --</option>
                  {userCars.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.marque} {car.modele} ({car.places} places)
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCarForm(!showNewCarForm)}
                  className="px-3 py-2 bg-emerald-100 rounded-lg hover:bg-emerald-200"
                >
                  ➕
                </button>
              </div>
            </div>

            {showNewCarForm && (
              <div className="p-4 border border-gray-200 rounded-lg mt-2 bg-gray-50 space-y-3"></div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Préférences
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      preferences: { ...f.preferences, fumeur: e.target.value },
                    }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-4 focus:ring-emerald-300/30"
                >
                  <option value="non-fumeur">🚭 Non-fumeur</option>
                  <option value="fumeur">🚬 Fumeur accepté</option>
                </select>
                <select
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      preferences: {
                        ...f.preferences,
                        animaux: e.target.value,
                      },
                    }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-4 focus:ring-emerald-300/30"
                >
                  <option value="pas-animal">🚫 Pas d’animal</option>
                  <option value="animal">🐾 Animaux acceptés</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Confirmer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
