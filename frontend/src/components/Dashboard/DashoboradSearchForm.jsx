import SearchButton from './SearchButton'
import SearchFieldset from './SearchFieldset'

const SearchForm = () => {
  return (
    <form
      className="mt-20 w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-2 
                     bg-ecoWhite/20 backdrop-blur-md rounded-[20px] rounded-2xl p-3 md:p-2"
      action="/covoiturages"
      role="search"
      method="GET"
    >
      <SearchFieldset />
      <SearchButton />
    </form>
  )
}
export default SearchForm
