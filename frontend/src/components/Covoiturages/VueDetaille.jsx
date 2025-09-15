import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

const ridesMock = [
  {
    id: 1,
    depart: "Paris",
    arrivee: "Lyon",
    date: "2025-09-20 09:00",
    duree: "4h30",
    places: 2,
    prix: 15,
    chauffeur: {
      nom: "Dimitri",
      avatar: "https://i.pravatar.cc/100?img=12",
      note: 4.58,
      preferences: {
        fumeur: false,
        animaux: true,
        musique: true,
      },
    },
    voiture: {
      modele: "Renault Zoe",
      immatriculation: "AB-123-CD",
      eco: true,
    },
    avis: [
      { id: 1, auteur: "Agata", note: 5, commentaire: "Super trajet !" },
      { id: 2, auteur: "Michael", note: 4, commentaire: "Très sympa." },
    ],
  },
  {
    id: 2,
    depart: "Marseille",
    arrivee: "Nice",
    date: "2025-09-22 08:00",
    duree: "2h10",
    places: 1,
    prix: 12,
    chauffeur: {
      nom: "Agata",
      avatar: "https://i.pravatar.cc/100?img=20",
      note: 4.75,
      preferences: {
        fumeur: false,
        animaux: false,
        musique: true,
      },
    },
    voiture: {
      modele: "Peugeot 208",
      immatriculation: "CD-456-EF",
      eco: false,
    },
    avis: [
      {
        id: 3,
        auteur: "Dimitri",
        note: 5,
        commentaire: "Trajet rapide et agréable.",
      },
      {
        id: 4,
        auteur: "Sophie",
        note: 4,
        commentaire: "Conductrice très sympa.",
      },
    ],
  },
  {
    id: 3,
    depart: "Lille",
    arrivee: "Bruxelles",
    date: "2025-09-25 07:30",
    duree: "1h45",
    places: 3,
    prix: 10,
    chauffeur: {
      nom: "Michael",
      avatar: "https://i.pravatar.cc/100?img=32",
      note: 4.9,
      preferences: {
        fumeur: false,
        animaux: true,
        musique: false,
      },
    },
    voiture: {
      modele: "Tesla Model 3",
      immatriculation: "GH-789-IJ",
      eco: true,
    },
    avis: [
      {
        id: 5,
        auteur: "Agata",
        note: 5,
        commentaire: "Confort exceptionnel !",
      },
      { id: 6, auteur: "Lucas", note: 5, commentaire: "Très ponctuel." },
    ],
  },
  {
    id: 4,
    depart: "Bordeaux",
    arrivee: "Toulouse",
    date: "2025-09-28 14:00",
    duree: "2h50",
    places: 2,
    prix: 18,
    chauffeur: {
      nom: "Sophie",
      avatar: "https://i.pravatar.cc/100?img=45",
      note: 4.6,
      preferences: {
        fumeur: true,
        animaux: false,
        musique: true,
      },
    },
    voiture: {
      modele: "Citroën C3",
      immatriculation: "KL-321-MN",
      eco: false,
    },
    avis: [
      {
        id: 7,
        auteur: "Michael",
        note: 3,
        commentaire: "Pause clope trop souvent.",
      },
      {
        id: 8,
        auteur: "Julie",
        note: 4,
        commentaire: "Trajet correct dans l'ensemble.",
      },
    ],
  },
  {
    id: 5,
    depart: "Nantes",
    arrivee: "Rennes",
    date: "2025-10-01 10:15",
    duree: "1h20",
    places: 4,
    prix: 9,
    chauffeur: {
      nom: "Lucas",
      avatar: "https://i.pravatar.cc/100?img=55",
      note: 4.8,
      preferences: {
        fumeur: false,
        animaux: true,
        musique: true,
      },
    },
    voiture: {
      modele: "Volkswagen ID.3",
      immatriculation: "OP-654-QR",
      eco: true,
    },
    avis: [
      {
        id: 9,
        auteur: "Agata",
        note: 5,
        commentaire: "Super musique pendant le trajet !",
      },
      {
        id: 10,
        auteur: "Dimitri",
        note: 5,
        commentaire: "Voiture très confortable.",
      },
    ],
  },
];

export default function CovoiturageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride] = useState(ridesMock.find((r) => r.id === Number(id)));

  if (!ride) {
    return (
      <div className="p-6 text-center text-gray-500">
        Ce covoiturage n'existe pas.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <img
            src={ride.chauffeur.avatar}
            alt={ride.chauffeur.nom}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-semibold text-gray-700">
              {ride.chauffeur.nom}
            </h2>
            <p className="text-yellow-500">
              ⭐ {ride.chauffeur.note.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="space-y-2 text-gray-600">
          <p>
            <span className="font-semibold">Trajet:</span> {ride.depart} →{" "}
            {ride.arrivee}
          </p>
          <p>
            <span className="font-semibold">Date:</span> {ride.date}
          </p>
          <p>
            <span className="font-semibold">Durée estimée:</span> {ride.duree}
          </p>
          <p>
            <span className="font-semibold">Places disponibles:</span>{" "}
            {ride.places}
          </p>
          <p>
            <span className="font-semibold">Prix:</span> {ride.prix} €
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Véhicule</h3>
          <p>Modèle: {ride.voiture.modele}</p>
          <p>Immatriculation: {ride.voiture.immatriculation}</p>
          <p>
            Type:{" "}
            {ride.voiture.eco ? "Électrique / Éco" : "Thermique classique"}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">
            Préférences chauffeur
          </h3>
          <ul className="list-disc pl-5 text-gray-600">
            <li>
              🚭 {ride.chauffeur.preferences.fumeur ? "Fumeur" : "Non fumeur"}
            </li>
            <li>
              🐶{" "}
              {ride.chauffeur.preferences.animaux
                ? "Animaux acceptés"
                : "Pas d'animaux"}
            </li>
            <li>
              🎵{" "}
              {ride.chauffeur.preferences.musique
                ? "Musique OK"
                : "Pas de musique"}
            </li>
          </ul>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Avis passagers</h3>
          <div className="space-y-2">
            {ride.avis.map((a) => (
              <div key={a.id} className="border-b pb-2">
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
