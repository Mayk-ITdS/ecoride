import { usePublicReviews } from '@/hooks/usePublicReviews'

export default function HomeReviews() {
  const { items, loading, error } = usePublicReviews({ page: 1, limit: 9 })
  if (loading) return <div>Chargement…</div>
  if (error) return <div className="text-red-600">{error}</div>
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {items.map((r, i) => (
        <div key={i} className="p-4 rounded-2xl bg-white shadow">
          <div className="font-semibold">{r.author}</div>
          <div className="text-sm text-gray-500">
            {r.location} • {new Date(r.createdAt).toLocaleDateString()}
          </div>
          <div className="mt-2">{r.text}</div>
          <div className="mt-2 text-yellow-500">{'★'.repeat(r.rating)}</div>
        </div>
      ))}
    </div>
  )
}
