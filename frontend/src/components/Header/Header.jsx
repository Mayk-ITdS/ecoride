import { useState } from "react";
import MenuDesktop from "./MenuDesktop";
import MenuMobile from "./MenuMobile";
import Logo from "./Logo";
import HamburgerButton from "./HamburgerButton";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const onToggle = () => {
    setIsOpen((prev) => !prev);
  };
  return (
    <header className="absolute top-0 left-0 w-full flex justify-between items-center py-6 px-8 z-10">
      <Logo />
      <MenuDesktop />
      <HamburgerButton isOpen={isOpen} onToggle={onToggle} />
      <MenuMobile isOpen={isOpen} onClose={onToggle} />
    </header>
  );
};
export default Header;
