import SearchInput from "./SearchInput";

const SearchFieldset = () => {
  return (
    <fieldset className="w-full flex flex-col md:flex-row flex-1 gap-2">
      <legend className="sr-only">Rechercher un covoiturage</legend>
      <SearchInput />
    </fieldset>
  );
};
export default SearchFieldset;
