import SearchInput from "./SearchInput";

const AdvancedFiltersModal = ({ open, onClose, filters, onChange }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Filtres avancés</h2>

        <div className="space-y-3">
          <SearchInput
            id="prixMax"
            name="prixMax"
            type="number"
            placeholder="Prix max (€)"
            value={filters.prixMax}
            onChange={onChange}
          />
          <SearchInput
            id="maxDuree"
            name="maxDuree"
            type="number"
            placeholder="Durée max (minutes)"
            value={filters.maxDuree}
            onChange={onChange}
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="isEco"
              checked={filters.isEco}
              onChange={onChange}
              className="w-4 h-4"
            />
            Véhicule électrique
          </label>
          <SearchInput
            id="minAvisScore"
            name="minAvisScore"
            type="number"
            placeholder="Note minimale"
            value={filters.minAvisScore}
            onChange={onChange}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">
            Fermer
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-ecoGreen text-white hover:bg-green-700"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFiltersModal;
