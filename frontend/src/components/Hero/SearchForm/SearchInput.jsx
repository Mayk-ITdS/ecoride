const SearchInput = () => {
  return (
    <>
      <label htmlFor="depart" className="sr-only">
        Départ
      </label>
      <input
        required
        id="depart"
        name="depart"
        type="text"
        placeholder="Départ"
        className="flex-1 min-w-[140px] w-full md:w-auto py-6 px-4 md:h-14 
                       bg-[#2B2929]/50 text-white placeholder:text-white/70
                       focus:outline-none focus:ring-2 focus:ring-ecoGreen"
      />
      <label htmlFor="arrive" className="sr-only">
        Arrivée
      </label>
      <input
        required
        id="arrive"
        name="arrive"
        type="text"
        placeholder="Arrivée"
        className="flex-1 min-w-[140px] w-full py-6 md:h-14 px-4 
                       bg-[#2B2929]/50 text-white placeholder:text-white/70
                       focus:outline-none focus:ring-2 focus:ring-ecoGreen"
      />
      <label htmlFor="date" className="sr-only">
        Date
      </label>
      <input
        required
        id="date"
        name="date"
        type="date"
        className="min-w-[140px] w-full md:w-auto py-6 md:h-14 px-4 
                       bg-[#2B2929]/50  text-white placeholder:text-white
                       focus:outline-none focus:ring-2 focus:ring-ecoGreen"
      />
    </>
  );
};
export default SearchInput;
