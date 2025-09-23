const ConfirmModal = ({ open, onClose, onConfirm, trajet }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-fadeIn">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-emerald-100 text-emerald-700 rounded-full p-3">
            🚗
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 text-center">
          Confirmer la participation
        </h3>
        <p className="text-gray-600 text-center mt-2">
          Voulez-vous vraiment participer au trajet{' '}
          <span className="font-semibold text-emerald-700">
            {trajet?.depart} → {trajet?.arrivee}
          </span>{' '}
          ?
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow transition"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}
export default ConfirmModal
