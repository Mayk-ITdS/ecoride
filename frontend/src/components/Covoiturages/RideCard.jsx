import { useRef } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Users, Euro } from "lucide-react";

export default function RideCard({ ride, onParticiper }) {
  const cardRef = useRef(null);

  return (
    <div
      ref={cardRef}
      className="bg-white shadow rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition"
    >
      <div className="flex items-center gap-3 mb-3">
        <img
          src={ride.chauffeur.avatar}
          alt={ride.chauffeur.nom}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-gray-700">
            {ride.chauffeur.nom}{" "}
            <span className="text-sm text-gray-500">(chauffeur)</span>
          </p>
          <p className="text-sm text-yellow-500">
            ⭐ {ride.chauffeur.note.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="space-y-1 mb-3 text-sm text-gray-600">
        <p>
          🚗 {ride.depart} → {ride.arrivee}
        </p>
        <p className="flex items-center gap-1">
          <Calendar className="w-4 h-4" /> {ride.date}
        </p>
        <p className="flex items-center gap-1">
          <Clock className="w-4 h-4" /> Durée estimée : {ride.duree}
        </p>
        <p className="flex items-center gap-1">
          <Users className="w-4 h-4" /> {ride.places} places
        </p>
        <p className="flex items-center gap-1">
          <Euro className="w-4 h-4" /> Prix : {ride.prix} €
        </p>
      </div>
      <div className="flex justify-between mt-3">
        <button
          onClick={() => onParticiper?.(ride)}
          className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm hover:bg-emerald-200"
        >
          Participer
        </button>
        <Link
          to={`/covoiturage/${ride.id}`}
          className="px-3 py-1 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
        >
          Détails
        </Link>
      </div>
    </div>
  );
}
