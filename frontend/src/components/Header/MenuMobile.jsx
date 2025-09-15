import { useEffect, useRef } from "react";

const MenuMobile = ({ isOpen, onClose }) => {
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);
  return (
    <>
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute top-full left-0 w-full bg-ecoGray/90 backdrop-blur-md md:hidden"
        >
          <nav className="flex flex-col items-center gap-6 py-8 text-lg text-white font-medium">
            <a
              href="/covoiturages"
              className="hover:text-ecoGreen transition"
              onClick={onClose}
            >
              Covoiturages
            </a>
            <a
              href="/contact"
              className="hover:text-ecoGreen transition"
              onClick={onClose}
            >
              Contact
            </a>
            <a
              href="/login"
              className="hover:text-ecoGreen transition"
              onClick={onClose}
            >
              Log in
            </a>
          </nav>
        </div>
      )}
    </>
  );
};
export default MenuMobile;
