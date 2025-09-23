import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchButton from './SearchButton'
import SearchFieldset from './SearchFieldset'
import AdvancedFiltersModal from './AdvancedFilterModal'

const SearchForm = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    depart: '',
    arrivee: '',
    date: '',
    prixMax: '',
    maxDuree: '',
    isEco: false,
    minAvisScore: '',
  })
  const [openFilters, setOpenFilters] = useState(false)
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target

    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value,
    })
  }
  const buildQueryString = (obj) => {
    const query = new URLSearchParams()
    Object.entries(obj).forEach(([key, value]) => {
      const isEmpty =
        value === '' || value === null || value === undefined || value === false
      if (!isEmpty) query.set(key, String(value))
    })
    return query.toString()
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    navigate(`/covoiturages?${buildQueryString(filters)}}`)
  }

  const handleApplyAdvanced = () => {
    navigate(`/covoiturages?${buildQueryString(filters)}`)
    setOpenFilters(false)
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mt-20 w-full md:w-auto mx-auto flex flex-col md:flex-row items-center gap-2 
                     bg-ecoWhite/20 backdrop-blur-md rounded-[20px] rounded-2xl p-3 md:p-2"
        role="search"
      >
        <SearchFieldset filters={filters} onChange={handleChange} />
        <SearchButton />
        <button
          type="button"
          onClick={() => setOpenFilters(true)}
          className="px-4 py-2 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
        >
          Filtres avancés
        </button>
      </form>
      <AdvancedFiltersModal
        open={openFilters}
        onClose={() => setOpenFilters(false)}
        filters={filters}
        onChange={handleChange}
        onAplly={handleApplyAdvanced}
      />
    </>
  )
}
export default SearchForm
