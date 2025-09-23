const SearchInput = ({
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
}) => {
  let normalized = value ?? ''
  if (type === 'date') {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      const y = value.getFullYear()
      const m = String(value.getMonth() + 1).padStart(2, '0')
      const d = String(value.getDate()).padStart(2, '0')
      normalized = `${y}-${m}-${d}`
    } else if (typeof value !== 'string') {
      normalized = ''
    }
  } else if (typeof normalized !== 'string') {
    normalized = String(normalized ?? '')
  }
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={normalized}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 min-w-[140px] w-full md:w-auto py-6 px-4 md:h-14 
                   bg-[#2B2929]/50 text-white placeholder:text-white/70
                   focus:outline-none focus:ring-2 focus:ring-ecoGreen"
      />
    </>
  )
}
export default SearchInput
