const MenuDesktop = () => {
  return (
    <nav className="hidden md:flex items-center gap-10 text-white/90 font-medium">
      <a href="/covoiturages" className="hover:text-ecoGreen transition">
        Covoiturages
      </a>
      <a href="/contact" className="hover:text-ecoGreen transition">
        Contact
      </a>
      <a href="/login" className="hover:text-ecoGreen transition">
        Log in
      </a>
    </nav>
  );
};
export default MenuDesktop;
