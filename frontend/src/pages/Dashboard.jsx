import { useState } from "react";
import DataTable from "../components/Dashboard/DataTable";
import ProposerTrajetModal from "@/components/Dashboard/ProposerTrajetModal";
import HeaderDashboard from "@/components/Dashboard/HeaderDashboard";

export default function Dashboard() {
  const [role, setRole] = useState("passager+chauffeur");
  const [isTrajetModalOpen, setTrajetModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      <HeaderDashboard />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="col-span-1 bg-white shadow-md rounded-2xl p-6 space-y-4">
          <div className="text-center">
            <img
              src="https://i.pravatar.cc/100"
              alt="user"
              className="w-24 h-24 rounded-full mx-auto mb-2"
            />
            <h2 className="font-semibold text-gray-700">Agata</h2>
            <p className="text-sm text-gray-500">Voyageuse active</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              Rôle utilisateur
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-sm"
            >
              <option value="passager">Passager</option>
              <option value="passager+chauffeur">Passager + Chauffeur</option>
              <option value="chauffeur">Chauffeur</option>
            </select>
          </div>

          <nav className="space-y-3">
            <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50">
              🚗 Mes voyages
            </button>
            {role !== "passager" && (
              <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50">
                🚙 Mes voitures
              </button>
            )}
            <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50">
              ⚙️ Modifier mon profil
            </button>
            <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50">
              💳 Mes paiements
            </button>
          </nav>
        </aside>

        <main className="col-span-3 space-y-6">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white shadow rounded-2xl p-4">
              <p className="text-sm text-gray-600">🌱 CO₂ économisé</p>
              <h3 className="text-xl font-bold text-emerald-600">12 kg</h3>
              <p className="text-xs text-gray-500">ce mois-ci</p>
            </div>

            <div className="bg-white shadow rounded-2xl p-4">
              <p className="text-sm text-gray-600">👋 Communauté</p>
              <h3 className="text-xl font-bold text-emerald-600">
                +3 nouveaux
              </h3>
              <p className="text-xs text-gray-500">dans votre ville</p>
            </div>

            <div className="bg-white shadow rounded-2xl p-4">
              <p className="text-sm text-gray-600">🏆 Badges</p>
              <h3 className="text-xl font-bold text-emerald-600">
                Super Chauffeur
              </h3>
              <p className="text-xs text-gray-500">Note moyenne 4.8⭐</p>
            </div>
          </section>
          <DataTable />
        </main>
        <ProposerTrajetModal
          onClose={() => setTrajetModalOpen(false)}
          isOpen={isTrajetModalOpen}
        />
        <section className="col-span-1 lg:col-span-4 mt-6">
          <section className="grid grid-cols-1 w-fit mx-auto md:grid-cols-3 gap-4">
            <div className="bg-white shadow rounded-2xl p-4">
              <button
                className="text-md text-center w-full py-4 rounded-2 px-8 border-4 bg-ecoGreen"
                onClick={() => setTrajetModalOpen(true)}
              >
                Proposer un trajet
              </button>
            </div>

            <div className="bg-white shadow rounded-2xl p-4"></div>

            <div className="bg-white shadow rounded-2xl p-4">
              <button
                className="text-md text-center w-full py-4 rounded-2 px-8 border-4 bg-ecoGreen"
                onClick={() => setTrajetModalOpen(true)}
              >
                Ajouter une voiture
              </button>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
