import AjouterVoitureForm from './AjouterVoitureForm'

export default function AjouterVoitureModal({
  isOpen,
  onClose,
  onAdded,
  userId,
}) {
  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.()
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center
                    bg-black/40 backdrop-blur-sm px-4 transition-opacity duration-200
                    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`relative w-full max-w-lg rounded-2xl bg-white/90 shadow-2xl ring-1 ring-black/5
                      transition-transform duration-200
                      ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-2'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full 
                     text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Fermer"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 border-b px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            🚙
          </div>
          <div>
            <h2
              id="add-car-title"
              className="text-lg font-semibold text-gray-900"
            >
              Ajouter un véhicule
            </h2>
            <p className="text-sm text-gray-500">
              Renseignez les informations de base
            </p>
          </div>
        </div>

        <div className="px-5 py-4">
          <AjouterVoitureForm
            onCancel={onClose}
            userId={userId}
            onSuccess={() => {
              onAdded?.()
              onClose?.()
            }}
          />
        </div>
      </div>
    </div>
  )
}
