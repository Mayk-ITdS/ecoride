import { useMemo, useState } from 'react'
import useAxiosWithAuth from '../../hooks/useAxiosWithAuth'

const ALLOWED_CARBURANTS = ['essence', 'diesel', 'electrique', 'hybride']

export default function AjouterVoitureForm({ onSuccess, onCancel }) {
  const api = useAxiosWithAuth()
  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const [formData, setFormData] = useState({
    marque: '',
    modele: '',
    couleur: '',
    immatriculation: '',
    places: 4,
    annee: currentYear,
    date_premiere_immatriculation: '',
    type_carburant: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target
    setError(null)

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleCarburantChange = (e) => {
    const value = e.target.value
    setError(null)
    setFormData((prev) => ({
      ...prev,
      type_carburant: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      if (!ALLOWED_CARBURANTS.includes(formData.type_carburant)) {
        throw new Error(
          'Type de carburant invalide. Choisissez essence, diesel, électrique ou hybride.',
        )
      }

      const annee = Number(formData.annee)
      if (!annee || annee < 1980 || annee > currentYear) {
        throw new Error(`L’année doit être entre 1980 et ${currentYear}.`)
      }

      if (
        formData.date_premiere_immatriculation &&
        formData.date_premiere_immatriculation > todayISO
      ) {
        throw new Error(
          'La date de première immatriculation ne peut pas être dans le futur.',
        )
      }

      const payload = {
        marque: formData.marque?.trim(),
        modele: formData.modele?.trim(),
        immatriculation: formData.immatriculation?.trim(),
        nb_places: Number(formData.places) || 1,
        is_electric: formData.type_carburant === 'electrique',
        type_carburant: formData.type_carburant,
        couleur: formData.couleur?.trim() || null,
        annee,
        date_premiere_immatriculation:
          formData.date_premiere_immatriculation || null,
      }

      const res = await api.post('/voitures', payload)
      onSuccess?.(res.data)
    } catch (err) {
      console.error(err)
      setError(
        err?.response?.data?.error || err.message || 'Une erreur est survenue.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Marque
          </label>
          <input
            name="marque"
            value={formData.marque}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Modèle
          </label>
          <input
            name="modele"
            value={formData.modele}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Immatriculation
          </label>
          <input
            name="immatriculation"
            value={formData.immatriculation}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Places
          </label>
          <input
            type="number"
            min={1}
            max={9}
            name="places"
            value={formData.places}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type carburant
          </label>
          <select
            name="type_carburant"
            value={formData.type_carburant}
            onChange={handleCarburantChange}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            required
          >
            <option value="">-- choisissez --</option>
            <option value="essence">Essence</option>
            <option value="diesel">Diesel</option>
            <option value="electrique">Électrique</option>
            <option value="hybride">Hybride</option>
          </select>
          <label className="flex items-center gap-2 mt-2 text-sm">
            <input
              type="checkbox"
              checked={formData.type_carburant === 'electrique'}
              readOnly
              className="h-4 w-4"
            />
            Électrique
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Couleur
          </label>
          <input
            type="text"
            name="couleur"
            value={formData.couleur}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Année
          </label>
          <input
            type="number"
            name="annee"
            min={1980}
            max={currentYear}
            value={formData.annee}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Date de première immatriculation
          </label>
          <input
            type="date"
            name="date_premiere_immatriculation"
            value={formData.date_premiere_immatriculation}
            onChange={handleChange}
            max={todayISO}
            className="mt-1 w-full text-black rounded-lg border px-3 py-2"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
          disabled={submitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? 'Ajout...' : 'Ajouter le véhicule'}
        </button>
      </div>
    </form>
  )
}
