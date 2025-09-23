const ReviewCard = ({ r, onApprove, onReject, busy }) => {
  return (
    <tr className="border-b">
      <td className="py-2">{r.id}</td>
      <td className="py-2">{r.passager_pseudo}</td>
      <td className="py-2">{r.chauffeur_pseudo}</td>
      <td className="py-2">{r.note}/5</td>
      <td className="py-2 max-w-[340px] truncate" title={r.commentaire}>
        {r.commentaire}
      </td>
      <td className="py-2 text-right space-x-2">
        <button
          className={`px-3 py-1 rounded-lg text-sm bg-emerald-100 text-emerald-700 hover:bg-emerald-200 ${busy ? 'opacity-60 cursor-not-allowed' : ''}`}
          disabled={busy}
          onClick={() => onApprove(r)}
        >
          Valider
        </button>
        <button
          className={`px-3 py-1 rounded-lg text-sm bg-red-100 text-red-600 hover:bg-red-200 ${busy ? 'opacity-60 cursor-not-allowed' : ''}`}
          disabled={busy}
          onClick={() => onReject(r)}
        >
          Refuser
        </button>
      </td>
    </tr>
  )
}
export default ReviewCard
