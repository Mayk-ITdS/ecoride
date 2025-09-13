const HamburgerButton = ({ isOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="md:hidden flex flex-col justify-between w-10 h-10 p-2 focus:outline-none focus:ring-2 focus:ring-ecoGreen focus:ring-offset-2"
      aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
      aria-expanded={isOpen}
    >
      <span
        className={`h-0.5 w-full bg-white rounded transition-transform duration-300 ease-in-out ${
          isOpen ? "rotate-45 translate-y-2" : ""
        }`}
      />
      <span
        className={`h-0.5 w-full bg-white rounded transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-0" : ""
        }`}
      />
      <span
        className={`h-0.5 w-full bg-white rounded transition-transform duration-300 ease-in-out ${
          isOpen ? "-rotate-45 -translate-y-2" : ""
        }`}
      />
    </button>
  );
};
export default HamburgerButton;
