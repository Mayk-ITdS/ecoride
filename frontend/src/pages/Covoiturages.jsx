import SearchForm from '../components/Hero/SearchForm/SearchForm'
import RideCard from '../components/Covoiturages/RideCard'
import HeaderCovoiturages from '@/components/Covoiturages/HeaderCovoiturages'
import HeroSloganCovoiturages from '@/components/Covoiturages/HeroSloganCovoiturages'
import { useTrajets } from '../hooks/useTrajets'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import ConfirmModal from '../components/Covoiturages/ConfirmModal'
import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import useAuthorization from '../hooks/useAuthorization'
import useAxiosWithAuth from '../hooks/useAxiosWithAuth'
export default function Covoiturages() {
  const api = useAxiosWithAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedId, setSelectedId] = useState()
  const [selectedTrajet, setSelectedTrajet] = useState()
  const [searchTriggered, setSearchTriggered] = useState(false)
  const { user } = useAuthorization()
  const [filters, setFilters] = useState({
    depart: '',
    arrivee: '',
    date: '',
    prixMax: '',
    maxDuree: '',
    isEco: false,
    minAvisScore: '',
  })
  useEffect(() => {
    const query = new URLSearchParams(location.search)
    const newFilters = {
      depart: query.get('depart') || '',
      arrivee: query.get('arrivee') || '',
      date: query.get('date') || '',
      prixMax: query.get('prixMax') || '',
      maxDuree: query.get('maxDuree') || '',
      isEco: query.get('isEco') === 'true',
      minAvisScore: query.get('minAvisScore') || '',
    }
    setFilters(newFilters)
    setSearchTriggered(
      !!(newFilters.depart || newFilters.arrivee || newFilters.date),
    )
  }, [location.search])

  const { data: trajets, loading } = useTrajets(filters, {
    enabled: searchTriggered,
  })

  const userId = user?.id_user
  const visibleTrajets = useMemo(() => {
    if (!Array.isArray(trajets)) return []
    return userId ? trajets.filter((t) => t.id_chauffeur !== userId) : trajets
  }, [trajets, userId])

  const handleParticiper = (trajet) => {
    if (!user) {
      navigate('/login', { state: { from: location } })
      const trajetId = trajet.id_trajet
      setSelectedId(trajetId)
      return
    }

    setSelectedTrajet(trajet)
    console.log(trajet)
  }

  const handleConfirm = async (id_trajet) => {
    if (!user) return
    console.log(selectedTrajet)
    try {
      await api.post(`/trajets/${id_trajet}/participer`)
      console.log('Participation envoyée !')
    } catch (err) {
      console.error(
        'Erreur participation:',
        err.response?.data || err.message || err,
      )
      alert(err.response?.data?.error || 'Erreur participation')
    }
  }

  return (
    <div className="bg-gradient-radial from-green-100 via-green-200 to-green-400">
      <div className="min-h-screen">
        <HeaderCovoiturages />
        <div className="flex w-full justify-center">
          <div className="flex flex-col font-display items-center text-center gap-6">
            <HeroSloganCovoiturages />
            <SearchForm />
            <div className="mt-4 w-full md:w-auto mx-auto bg-ecoWhite/20 backdrop-blur-md rounded-2xl p-3">
              <button className="bg-ecoGreen w-full mt-4 text-white py-3 px-6 rounded-2xl font-display">
                Proposer un covoiturage
              </button>
            </div>
          </div>
        </div>
        <section className="max-w-4xl mx-auto mt-20 mb-2 text-center">
          <h2 className="text-2xl font-display mb-2">Résultats de recherche</h2>
          <div className="border-b-4 border-gray-300 mx-auto" />
        </section>
      </div>
      <section className="min-h-screen">
        {loading ? (
          <p className="text-center text-gray-500 mt-12">Chargement...</p>
        ) : visibleTrajets.length > 0 ? (
          <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleTrajets.map((trajet) => (
              <RideCard
                key={trajet.id}
                trajet={trajet}
                onParticiper={handleParticiper}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-12">
            Aucun covoiturage trouvé pour vos critères.
          </div>
        )}
      </section>
      {user && (
        <ConfirmModal
          onClose={() => setSelectedTrajet(null)}
          open={!!selectedTrajet}
          trajet={selectedTrajet}
          onConfirm={() => selectedTrajet && handleConfirm(selectedTrajet.id)}
        />
      )}
    </div>
  )
}
