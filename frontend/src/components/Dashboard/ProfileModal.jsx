import { useEffect, useState } from 'react'
import useAxiosWithAuth from '../../hooks/useAxiosWithAuth'
import useAuthorization from '../../hooks/useAuthorization'

export default function ProfileModal({ isOpen, onClose }) {
  const [user, setUser] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const api = useAxiosWithAuth()
  const { user: loggedUser } = useAuthorization()
  const userId = loggedUser?.id_user

  useEffect(() => {
    if (!isOpen || !userId) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await api.get('/users/me')
        if (!cancelled) setUser(res.data)
      } catch (e) {
        console.error(e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isOpen, userId, api])

  if (!isOpen) return null

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const res = await api.put(`/users/me`, user)
      setUser(res.data.user)
      setEditMode(false)
    } catch (err) {
      console.error('Erreur sauvegarde profil:', err)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white/95 backdrop-blur p-6 rounded-2xl w-[28rem] shadow-xl ring-1 ring-black/5">
        <h2 className="text-lg font-semibold mb-4">Mon Profil</h2>
        {!user ? (
          <p className="text-gray-500">Chargement…</p>
        ) : editMode ? (
          <form onSubmit={handleSave} className="space-y-3">
            <input
              className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-4 focus:ring-emerald-300/30"
              value={user?.pseudo}
              onChange={(e) => setUser({ ...user, pseudo: e.target.value })}
            />
            <input
              className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-4 focus:ring-emerald-300/30"
              value={user?.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
            <button className="bg-emerald-600 text-white px-3 py-2 rounded hover:bg-emerald-700">
              Enregistrer
            </button>
          </form>
        ) : (
          <div className="space-y-2">
            <p>👤 {user?.pseudo}</p>
            <p>📧 {user?.email}</p>
            <button
              onClick={() => setEditMode(true)}
              className="px-3 py-2 border rounded"
            >
              Modifier
            </button>
          </div>
        )}
        <button onClick={onClose} className="mt-4 text-sm text-gray-500">
          Fermer
        </button>
      </div>
    </div>
  )
}
