import { useState } from 'react'
import useAxiosWithAuth from '../../hooks/useAxiosWithAuth'

const CreateEmployeeModal = ({ open, onClose, onCreated }) => {
  const api = useAxiosWithAuth()
  const [form, setForm] = useState({
    pseudo: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!open) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.pseudo || !form.email || !form.password) {
      return setError('Tous les champs sont requis')
    }
    if (form.password !== form.confirm) {
      return setError('Les mots de passe ne correspondent pas')
    }
    try {
      setSubmitting(true)
      await api.post('/admin/employees', {
        pseudo: form.pseudo,
        email: form.email,
        password: form.password,
      })
      onCreated?.()
      onClose()
    } catch (err) {
      setError(err?.response?.data?.error || 'Erreur')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Créer un compte employé
        </h3>

        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg p-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Pseudo</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              name="pseudo"
              value={form.pseudo}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Mot de passe</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Confirmer</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? 'Création…' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default CreateEmployeeModal
