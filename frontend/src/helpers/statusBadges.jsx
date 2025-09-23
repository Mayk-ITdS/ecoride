const badgeClass = {
  en_attente: 'bg-yellow-100 text-yellow-700',
  confirmé: 'bg-emerald-100 text-emerald-700',
  en_cours: 'bg-blue-100 text-blue-700',
  terminé: 'bg-gray-100 text-gray-600',
  annulé: 'bg-red-100 text-red-600',
  refusé: 'bg-red-100 text-red-600',
}
const Badge = ({ status }) => {
  const bClass = badgeClass[status] || 'bg-gray-100 text-gray-600'
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${bClass}`}
    >
      {status}
    </span>
  )
}
export default Badge
