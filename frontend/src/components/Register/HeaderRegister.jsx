import { useState } from 'react'
import MenuMobile from '../Header/MenuMobile'
import MenuDesktop from '../Header/MenuDesktop'
import Logo from '../Header/Logo'
import HamburgerButton from '../Header/HamburgerButton'
const HeaderRegister = () => {
  const [isOpen, setIsOpen] = useState(false)
  const onToggle = () => {
    setIsOpen((prev) => !prev)
  }
  return (
    <header className="w-full flex justify-between items-center py-6 px-8 z-10">
      <Logo />
      <MenuDesktop />
      <HamburgerButton isOpen={isOpen} onToggle={onToggle} />
      <MenuMobile isOpen={isOpen} onClose={onToggle} />
    </header>
  )
}
export default HeaderRegister
