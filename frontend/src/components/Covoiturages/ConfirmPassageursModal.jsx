export default function ConfirmPassageursModal({
  open,
  title = 'Confirmer',
  message = 'Êtes-vous sûr(e) ?',
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
  busy = false,
  danger = false,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600 mt-2">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={[
              'px-4 py-2 rounded-lg text-white',
              danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-emerald-600 hover:bg-emerald-700',
              busy ? 'opacity-60 cursor-not-allowed' : '',
            ].join(' ')}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Veuillez patienter…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
