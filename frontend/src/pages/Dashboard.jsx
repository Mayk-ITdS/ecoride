import { useState, useEffect } from 'react'
import DataTable from '../components/Dashboard/DataTable'
import ProposerTrajetModal from '@/components/Dashboard/ProposerTrajetModal'
import HeaderDashboard from '../components/Dashboard/HeaderDashboard.jsx'
import useAuthorization from '../hooks/useAuthorization.js'
import ProfileModal from '../components/Dashboard/ProfileModal'
import VoituresModal from '../components/Dashboard/VoiituresModal'
import AjouterVoitureModal from '../components/Dashboard/AjouterUneVoitureModal.jsx'
import useDashboardTrajets from '../hooks/useDashboardData.js'
import useAxiosWithAuth from '../hooks/useAxiosWithAuth.js'
export default function Dashboard() {
  const [isTrajetModalOpen, setTrajetModalOpen] = useState(false)
  const [isProfileOpen, setProfileOpen] = useState(false)
  const [isVoituresOpen, setVoituresOpen] = useState(false)
  const { user } = useAuthorization()
  const [isAddCarOpen, setAddCarOpen] = useState(false)
  const {} = useDashboardTrajets()
  const userId = user?.id_user
  const api = useAxiosWithAuth()
  const [role, setRole] = useState('passager')
  const [roleSaving, setRoleSaving] = useState(false)

  const dbToUiRole = (rolesArr = []) =>
    rolesArr.includes('chauffeur') ? 'passager+chauffeur' : 'passager'
  const uiToDbRole = (ui) => (ui === 'passager' ? 'passager' : 'chauffeur')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await api.get('/roles/me')
        const uiRole = dbToUiRole(res.data?.roles || [])
        if (alive) setRole(uiRole)
      } catch (e) {
        console.warn('get roles failed:', e?.response?.data || e.message)
      }
    })()
    return () => {
      alive = false
    }
  }, [api])
  const handleRoleChange = async (e) => {
    const nextUiRole = e.target.value
    const prev = role
    setRole(nextUiRole)
    setRoleSaving(true)
    try {
      await api.patch('/roles/me', { role: nextUiRole })
    } catch (err) {
      console.error('set role failed:', err?.response?.data || err.message)
      setRole(prev)
      alert(
        err?.response?.data?.error || 'Impossible de mettre à jour le rôle.',
      )
    } finally {
      setRoleSaving(false)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-emerald-50 to-green-100">
      <HeaderDashboard />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="col-span-1 bg-white/90 backdrop-blur rounded-2xl ring-1 ring-black/5 shadow-sm p-6 space-y-5">
          <div className="text-center">
            <img
              src="https://i.pravatar.cc/100"
              alt="user"
              className="w-24 h-24 rounded-full mx-auto mb-3 ring-2 ring-emerald-200"
            />
            <h2 className="font-semibold text-gray-800 tracking-tight">
              {user?.pseudo}
            </h2>
            <p className="text-sm text-gray-500">Voyageuse active</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">
              Rôle utilisateur
            </label>
            <select
              value={role}
              onChange={handleRoleChange}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-300/30"
              disabled={roleSaving}
            >
              <option value="passager">Passager</option>
              <option value="passager+chauffeur">Passager + Chauffeur</option>
              <option value="chauffeur">Chauffeur</option>
            </select>
          </div>

          <nav className="space-y-2">
            <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 transition">
              🚗 Mes voyages
            </button>
            {role !== 'passager' && (
              <button
                onClick={() => setVoituresOpen(true)}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 transition"
              >
                🚙 Mes voitures
              </button>
            )}
            <button
              onClick={() => setProfileOpen(true)}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 transition"
            >
              ⚙️ Modifier mon profil
            </button>
            <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 transition">
              💳 Mes paiements
            </button>
          </nav>
        </aside>

        {/* Main */}
        <main className="col-span-1 lg:col-span-3 space-y-6">
          {/* KPI cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5">
              <p className="text-sm text-gray-600">🌱 CO₂ économisé</p>
              <h3 className="mt-1 text-2xl font-bold text-emerald-700">
                12 kg
              </h3>
              <p className="text-xs text-gray-500">ce mois‑ci</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5">
              <p className="text-sm text-gray-600">👋 Communauté</p>
              <h3 className="mt-1 text-2xl font-bold text-emerald-700">
                +3 nouveaux
              </h3>
              <p className="text-xs text-gray-500">dans votre ville</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5">
              <p className="text-sm text-gray-600">🏆 Badges</p>
              <h3 className="mt-1 text-2xl font-bold text-emerald-700">
                Super Chauffeur
              </h3>
              <p className="text-xs text-gray-500">Note moyenne 4.8⭐</p>
            </div>
          </section>

          <DataTable />
        </main>

        {/* Actions bas‑de‑page */}
        <section className="col-span-1 lg:col-span-4 mt-2">
          <section className="grid grid-cols-1 w-fit mx-auto md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5">
              <button
                className="text-md text-center w-full py-4 rounded-xl px-8 border-2 border-emerald-300 bg-ecoGreen hover:brightness-105 transition"
                onClick={() => setTrajetModalOpen(true)}
              >
                Proposer un trajet
              </button>
            </div>
            <div className="bg-transparent p-4" />
            {role !== 'passager' && (
              <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5">
                <button
                  className="text-md text-center w-full py-4 rounded-xl px-8 border-2 border-emerald-300 bg-ecoGreen hover:brightness-105 transition"
                  onClick={() => setAddCarOpen(true)}
                >
                  Ajouter une voiture
                </button>
              </div>
            )}
            <AjouterVoitureModal
              isOpen={isAddCarOpen}
              onClose={() => setAddCarOpen(false)}
              onAdded={() => {}}
            />
          </section>
        </section>
      </div>

      {/* Modales (inchangées fonctionnellement) */}
      <ProposerTrajetModal
        onClose={() => setTrajetModalOpen(false)}
        isOpen={isTrajetModalOpen}
      />
      <ProfileModal
        userId={userId}
        isOpen={isProfileOpen}
        onClose={() => setProfileOpen(false)}
      />
      <VoituresModal
        userId={userId}
        isOpen={isVoituresOpen}
        onClose={() => setVoituresOpen(false)}
        role={role}
        isAddCarOpen={isAddCarOpen}
      />
    </div>
  )
}
