const HeroSlogan = () => {
  return (
    <div>
      <h1
        className="mt-3 text-[32px] tracking-[1px] 
             font-poppins font-semibold text-center max-w-[702px] mx-auto"
      >
        <span className="text-black">Roulez ensemble, </span>
        <span className="text-white">respirez </span>
        <span className="text-ecoPurple">mieux</span>
      </h1>
      <p
        className="mt-8 text-[20px] leading-[51px] tracking-[1px] 
             text-white font-poppins text-center max-w-[702px] mx-auto"
      >
        La plateforme de covoiturage pour les voyageurs <br /> écoresponsables.
      </p>
    </div>
  );
};
export default HeroSlogan;
