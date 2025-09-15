import { Star } from "lucide-react";

const AvisCard = ({ text, author, location, rating }) => {
  return (
    <figure className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
      <blockquote className="italic text-gray-700">“{text}”</blockquote>

      <div className="flex items-center gap-1 mt-4 text-ecoYellow">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={18}
            className={i < rating ? "fill-current" : "opacity-30"}
          />
        ))}
      </div>
      <figcaption className="mt-4 text-sm text-gray-600">
        — {author}, <span className="text-gray-500">{location}</span>
      </figcaption>
    </figure>
  );
};

export default AvisCard;
