import { useState } from "react";
import SearchForm from "../components/Hero/SearchForm/SearchForm";
import RideCard from "../components/Covoiturages/RideCard";
import HeaderCovoiturages from "@/components/Covoiturages/HeaderCovoiturages";
import HeroSloganCovoiturages from "@/components/Covoiturages/HeroSloganCovoiturages";
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

export default function Covoiturages() {
  const [rides, setRides] = useState(ridesMock);

  const handleParticiper = (ride) => {
    alert(`Tu veux participer au trajet ${ride.depart} → ${ride.arrivee}?`);
  };

  return (
    <div className="bg-gradient-radial from-green-100 via-green-200 to-green-400">
      <div className="min-h-screen">
        <HeaderCovoiturages />
        <div className="flex w-full justify-center">
          <div className="flex flex-col font-display items-center text-center gap-6">
            <HeroSloganCovoiturages />
            <SearchForm />
            <div className="mt-4 w-full md:w-auto mx-auto bg-ecoWhite/20 backdrop-blur-md rounded-2xl p-3">
              <button className="bg-ecoGreen w-full mt-4 text-white py-3 px-6 rounded-2xl font-display">
                Proposer un covoiturage
              </button>
            </div>
          </div>
        </div>
        <section className="max-w-4xl mx-auto mt-20 mb-2 text-center">
          <h2 className="text-2xl font-display mb-2">Résultats de recherche</h2>
          <div className="border-b-4 border-gray-300 mx-auto" />
        </section>
      </div>
      <section className="min-h-screen">
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              onParticiper={handleParticiper}
            />
          ))}
        </div>
        {rides.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            Aucun covoiturage trouvé pour vos critères.
          </div>
        )}
      </section>
    </div>
  );
}
