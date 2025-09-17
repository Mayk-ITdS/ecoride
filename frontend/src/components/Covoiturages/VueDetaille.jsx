import { useParams, useNavigate } from "react-router-dom";
import { useTrajet } from "../../hooks/useTrajet.js";

export default function CovoiturageDetail() {
  const { id } = useParams();
  const { data: trajet, loading } = useTrajet(id);
  const navigate = useNavigate();
  console.log(trajet);

  if (loading) return <p>Loading...</p>;

  if (!trajet) {
    return <div className="p-6 text-center text-gray-500">Ce covoiturage n'existe pas.</div>;
  }
  const moyenneAvis =
    trajet.avis && trajet.avis.length > 0
      ? (trajet.avis.reduce((acc, a) => acc + a.note, 0) / trajet.avis.length).toFixed(1)
      : "Pas encore d'avis";
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-6">
      <div key={trajet.id} className="max-w-3xl mx-auto bg-white shadow rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <img
            // src={trajets.chauffeur.avatar}
            alt={trajet.chauffeur}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-semibold text-gray-700">{trajet.chauffeur.nom}</h2>
            <p className="text-yellow-500">⭐ {moyenneAvis}</p>
          </div>
        </div>
        <div className="space-y-2 text-gray-600">
          <p>
            <span className="font-semibold">Trajet:</span> {trajet.depart} → {trajet.arrivee}
          </p>
          <p>
            <span className="font-semibold">Date:</span> {trajet.date}
          </p>
          <p>
            <span className="font-semibold">Durée estimée:</span> {trajet.duree}
          </p>
          <p>
            <span className="font-semibold">Places disponibles:</span> {trajet.places}
          </p>
          <p>
            <span className="font-semibold">Prix:</span> {trajet.prix} €
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Véhicule</h3>
          <p>Modèle: {trajet.voiture.modele}</p>
          <p>Immatriculation: {trajet.voiture.immatriculation}</p>
          <p>Type: {trajet.voiture.eco ? "Électrique / Éco" : "Thermique classique"}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Préférences chauffeur</h3>
          <ul className="list-disc pl-5 text-gray-600">
            <li>🚭 {trajet.chauffeur.preferences.fumeur ? "Fumeur" : "Non fumeur"}</li>
            <li>
              🐶 {trajet.chauffeur.preferences.animaux ? "Animaux acceptés" : "Pas d'animaux"}
            </li>
            <li>🎵 {trajet.chauffeur.preferences.musique ? "Musique OK" : "Pas de musique"}</li>
          </ul>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Avis passagers</h3>
          <div className="space-y-2">
            {trajet.avis.map((a, j) => (
              <div key={j} className="border-b pb-2">
                <p className="text-sm font-semibold">{a.auteur}</p>
                <p className="text-yellow-500 text-sm">⭐ {a.note}</p>
                <p className="text-sm text-gray-600">{a.commentaire}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Retour
          </button>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
            Participer
          </button>
        </div>
      </div>
    </div>
  );
}
