import { useState } from "react";

const voyagesMock = [
  {
    id: 1,
    trajet: "Paris → Lyon",
    date: "2025-09-20",
    role: "Chauffeur",
    statut: "planifié",
    solde: 65,
  },
  {
    id: 2,
    trajet: "Paris → Nice",
    date: "2025-09-22",
    role: "Passager",
    statut: "confirmé",
    solde: -20,
  },
  {
    id: 3,
    trajet: "Lyon → Lille",
    date: "2025-09-25",
    role: "Chauffeur",
    statut: "en_cours",
    solde: 30,
  },
  {
    id: 4,
    trajet: "Bordeaux → Marseille",
    date: "2025-09-28",
    role: "Passager",
    statut: "terminé",
    solde: -15,
  },
  {
    id: 5,
    trajet: "Toulouse → Nantes",
    date: "2025-09-30",
    role: "Chauffeur",
    statut: "annulé",
    solde: 0,
  },
  {
    id: 6,
    trajet: "Lille → Paris",
    date: "2025-10-01",
    role: "Passager",
    statut: "planifié",
    solde: -25,
  },
];

const SortIcon = ({ active, direction }) => (
  <span className="ml-1 text-gray-500">
    {active ? (direction === "asc" ? "︿" : "﹀") : "﹀"}
  </span>
);

export default function DataTable() {
  const [selectedTrajet, setSelectedTrajet] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "asc",
  });
  const [roleFilter, setRoleFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 3;

  const sortedData = [...voyagesMock].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key])
      return sortConfig.direction === "asc" ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key])
      return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const filteredData = sortedData.filter((v) => {
    const roleMatch = roleFilter ? v.role === roleFilter : true;
    const statusMatch = statusFilter ? v.statut === statusFilter : true;
    return roleMatch && statusMatch;
  });
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        Historique des trajets
      </h2>
      <div className="flex gap-4 mb-4">
        <button
          className="px-3 py-1 border rounded-lg text-sm hover:bg-emerald-50"
          onClick={() =>
            setRoleFilter(roleFilter === null ? "Chauffeur" : null)
          }
        >
          Filtrer rôle {roleFilter && `: ${roleFilter}`}
        </button>
        <button
          className="px-3 py-1 border rounded-lg text-sm hover:bg-emerald-50"
          onClick={() =>
            setStatusFilter(statusFilter === null ? "planifié" : null)
          }
        >
          Filtrer statut {statusFilter && `: ${statusFilter}`}
        </button>
      </div>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-600 text-sm border-b">
              <th
                className="py-2 w-40 cursor-pointer"
                onClick={() => requestSort("trajet")}
              >
                Trajet{" "}
                <SortIcon
                  active={sortConfig.key === "trajet"}
                  direction={sortConfig.direction}
                />
              </th>
              <th
                className="py-2 w-32 cursor-pointer"
                onClick={() => requestSort("date")}
              >
                Date{" "}
                <SortIcon
                  active={sortConfig.key === "date"}
                  direction={sortConfig.direction}
                />
              </th>
              <th className="py-2 w-28">Rôle</th>
              <th className="py-2 w-28">Statut</th>
              <th
                className="py-2 w-24 cursor-pointer"
                onClick={() => requestSort("solde")}
              >
                Solde (€){" "}
                <SortIcon
                  active={sortConfig.key === "solde"}
                  direction={sortConfig.direction}
                />
              </th>
              <th className="py-2 w-28">Détails</th>
              <th className="py-2 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((v) => (
              <tr key={v.id} className="border-b">
                <td className="py-2 truncate">{v.trajet}</td>
                <td className="py-2">{v.date}</td>
                <td className="py-2">{v.role}</td>
                <td className="py-2 capitalize">{v.statut}</td>
                <td className="py-2">{v.solde}€</td>
                <td className="py-2">
                  <button
                    className="px-3 py-1 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
                    onClick={() => setSelectedTrajet(v)}
                  >
                    Détails
                  </button>
                </td>
                <td className="py-2 space-x-2">
                  {v.role === "Chauffeur" && v.statut === "planifié" && (
                    <button className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm hover:bg-emerald-200">
                      Démarrer
                    </button>
                  )}
                  {v.statut === "en_cours" && v.role === "Chauffeur" && (
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                      Terminer
                    </button>
                  )}
                  {["planifié", "confirmé"].includes(v.statut) && (
                    <button className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200">
                      Annuler
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4 text-sm">
        <span>
          Page {page} sur {totalPages}
        </span>
        <div className="space-x-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            ⬅️
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            ➡️
          </button>
        </div>
      </div>
      <div className="block md:hidden space-y-4 mt-6">
        {paginatedData.map((v) => (
          <div
            key={v.id}
            className="border rounded-xl p-4 shadow-sm bg-gray-50"
          >
            <h3 className="font-semibold text-gray-700">{v.trajet}</h3>
            <p className="text-sm text-gray-500">Date: {v.date}</p>
            <p className="text-sm text-gray-500">Rôle: {v.role}</p>
            <p className="text-sm text-gray-500 capitalize">
              Statut: {v.statut}
            </p>
            <p className="text-sm text-gray-500">Solde: {v.solde}€</p>

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                className="px-3 py-1 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
                onClick={() => setSelectedTrajet(v)}
              >
                Détails
              </button>
              {v.role === "Chauffeur" && v.statut === "planifié" && (
                <button className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm hover:bg-emerald-200">
                  Démarrer
                </button>
              )}
              {v.statut === "en_cours" && v.role === "Chauffeur" && (
                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                  Terminer
                </button>
              )}
              {["planifié", "confirmé"].includes(v.statut) && (
                <button className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200">
                  Annuler
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {selectedTrajet && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl p-6 shadow-lg w-11/12 md:w-1/2">
            <h3 className="text-lg font-semibold mb-4">
              Détails du trajet: {selectedTrajet.trajet}
            </h3>
            <p>Statut: {selectedTrajet.statut}</p>
            <p>Date: {selectedTrajet.date}</p>
            <p>Rôle: {selectedTrajet.role}</p>
            <p>Solde: {selectedTrajet.solde}€</p>

            <button
              className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => setSelectedTrajet(null)}
            >
              Retour
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
