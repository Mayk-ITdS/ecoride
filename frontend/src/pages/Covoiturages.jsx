import SearchForm from "../components/Hero/SearchForm/SearchForm";
import RideCard from "../components/Covoiturages/RideCard";
import HeaderCovoiturages from "@/components/Covoiturages/HeaderCovoiturages";
import HeroSloganCovoiturages from "@/components/Covoiturages/HeroSloganCovoiturages";
import { useTrajets } from "../hooks/useTrajets";
import { useState } from "react";

export default function Covoiturages() {
  const [filters, setFilters] = useState({
    depart: "",
    arrive: "",
    date: "",
    prixMax: "",
    maxDuree: "",
    isEco: false,
    minAvisScore: "",
  });

  const [searchTriggered, setSearchTriggered] = useState(false);
  const { data: trajets, loading } = useTrajets(filters, { enabled: searchTriggered });

  if (loading) return <p>Loading...</p>;
  const handleSearch = (newFilters) => {
    e.preventDefault();
    setFilters(newFilters);
    setSearchTriggered(true);
  };
  const handleParticiper = (trajets) => {
    alert(`Tu veux participer au trajet ${trajets.depart} → ${trajets.arrivee}?`);
  };

  return (
    <div className="bg-gradient-radial from-green-100 via-green-200 to-green-400">
      <div className="min-h-screen">
        <HeaderCovoiturages />
        <div className="flex w-full justify-center">
          <div className="flex flex-col font-display items-center text-center gap-6">
            <HeroSloganCovoiturages />
            <SearchForm onSearch={handleSearch} />
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
          {trajets.map((trajet) => (
            <RideCard key={trajet.id} trajet={trajet} onParticiper={handleParticiper} />
          ))}
        </div>
        {trajets.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            Aucun covoiturage trouvé pour vos critères.
          </div>
        )}
      </section>
    </div>
  );
}
