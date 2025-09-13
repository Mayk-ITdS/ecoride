const HeroBadges = () => {
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-4 xss:hidden">
      <span className="backdrop-blur-md bg-ecoGreen/70 text-white px-6 py-2 rounded-full text-sm font-medium">
        CO₂ économisés
      </span>
      <span className="backdrop-blur-md bg-ecoYellow/80 text-ecoGray px-6 py-2 rounded-full text-sm font-medium">
        Paiements sécurisés
      </span>
      <span className="backdrop-blur-md bg-ecoGreen/70 text-white px-6 py-2 rounded-full text-sm font-medium">
        Trajets vérifiés
      </span>
    </div>
  );
};
export default HeroBadges;
