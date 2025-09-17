const SearchInput = ({ id, name, type = "text", value, onChange, placeholder }) => {
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 min-w-[140px] w-full md:w-auto py-6 px-4 md:h-14 
                   bg-[#2B2929]/50 text-white placeholder:text-white/70
                   focus:outline-none focus:ring-2 focus:ring-ecoGreen"
      />
    </>
  );
};
export default SearchInput;
