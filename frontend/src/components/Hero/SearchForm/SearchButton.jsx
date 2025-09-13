const SearchButton = () => {
  return (
    <button
      aria-label="Rechercher un trajet"
      type="submit"
      className="flex flex-1 w-full h-full md:w-auto py-6 md:h-14 rounded-[30px] px-6 justify-center items-center 
                       bg-ecoPurple text-white font-semibold hover:bg-purple-700 transition"
    >
      Rechercher
    </button>
  );
};
export default SearchButton;
