import { useState } from "react";

export default function ProposerTrajetModal({ isOpen, onClose }) {
  const [selectedCar, setSelectedCar] = useState("");
  const [showNewCarForm, setShowNewCarForm] = useState(false);

  const userCars = [
    { id: 1, marque: "Tesla", modele: "Model 3", places: 4 },
    { id: 2, marque: "Renault", modele: "Clio", places: 5 },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-11/12 md:w-2/3 lg:w-1/2 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-emerald-700 mb-4">
          🚗 Proposer un trajet
        </h2>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Adresse de départ"
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Adresse d’arrivée"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="datetime-local"
              placeholder="Heure de départ"
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="datetime-local"
              placeholder="Heure d’arrivée estimée"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Prix (€)"
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="number"
              placeholder="Nombre de places dispo"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Choisir un véhicule
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedCar}
                onChange={(e) => setSelectedCar(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2"
              >
                <option value="">-- Sélectionner --</option>
                {userCars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.marque} {car.modele} ({car.places} places)
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewCarForm(!showNewCarForm)}
                className="px-3 py-2 bg-emerald-100 rounded-lg hover:bg-emerald-200"
              >
                ➕
              </button>
            </div>
          </div>
          {showNewCarForm && (
            <div className="p-4 border rounded-lg mt-2 bg-gray-50 space-y-3">
              <input
                type="text"
                placeholder="Marque"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Modèle"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Plaque d’immatriculation"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="date"
                placeholder="Date de première immatriculation"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="number"
                placeholder="Nombre de places"
                className="w-full border rounded-lg px-3 py-2"
              />
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" /> Véhicule électrique ?
              </label>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              Préférences
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select className="w-full border rounded-lg px-3 py-2">
                <option value="non-fumeur">🚭 Non-fumeur</option>
                <option value="fumeur">🚬 Fumeur accepté</option>
              </select>
              <select className="w-full border rounded-lg px-3 py-2">
                <option value="pas-animal">🚫 Pas d’animal</option>
                <option value="animal">🐾 Animaux acceptés</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
