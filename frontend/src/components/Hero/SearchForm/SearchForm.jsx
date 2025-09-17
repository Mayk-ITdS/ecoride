import { useState } from "react";
import SearchButton from "./SearchButton";
import SearchFieldset from "./SearchFieldset";
import AdvancedFiltersModal from "./AdvancedFilterModal";

const SearchForm = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    depart: "",
    arrive: "",
    date: "",
  });
  const [openFilters, setOpenFilters] = useState(false);
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };
  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mt-20 w-full md:w-auto mx-auto flex flex-col md:flex-row items-center gap-2 
                     bg-ecoWhite/20 backdrop-blur-md rounded-[20px] rounded-2xl p-3 md:p-2"
        action="/covoiturages"
        role="search"
        method="GET"
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
      />
    </>
  );
};
export default SearchForm;
