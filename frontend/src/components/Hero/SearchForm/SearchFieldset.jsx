import SearchInput from "./SearchInput";

const SearchFieldset = ({ filters, onChange }) => {
  return (
    <fieldset className="w-full flex flex-col md:flex-row flex-1 gap-2">
      <legend className="sr-only">Rechercher un covoiturage</legend>
      <SearchInput
        id="depart"
        name="depart"
        placeholder="Départ"
        value={filters.depart}
        onChange={onChange}
      />
      <SearchInput
        id="arrive"
        name="arrive"
        placeholder="Arrivée"
        value={filters.arrive}
        onChange={onChange}
      />
      <SearchInput
        id="date"
        name="date"
        type="date"
        placeholder="Date"
        value={filters.date}
        onChange={onChange}
      />
    </fieldset>
  );
};
export default SearchFieldset;
