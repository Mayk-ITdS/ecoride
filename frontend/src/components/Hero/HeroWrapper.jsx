import HeroBadges from "./HeroBadges";
import HeroSlogan from "./HeroSlogan";
import Header from "../Header/Header";
import SearchForm from "./SearchForm/SearchForm";
const HeroWrapper = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      <img
        src="/bg-home-desktop.webp"
        alt="EcoRide car"
        className="absolute inset-0 w-full h-full object-cover object-[center_80%]"
      />
      <div className="absolute flex pt-[10vh] inset-0 flex-col items-center px-4 text-center text-white">
        <Header />
        <HeroSlogan />
        <SearchForm />
        <HeroBadges />
      </div>
    </section>
  );
};
export default HeroWrapper;
