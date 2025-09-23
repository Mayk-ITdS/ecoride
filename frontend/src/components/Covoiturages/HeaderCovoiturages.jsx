import { useState } from 'react'
import MenuDesktop from '../Header/MenuDesktop'
import MenuMobile from '../Header/MenuMobile'
import Logo from '../Header/Logo'
import HamburgerButton from '../Header/HamburgerButton'

const HeaderCovoiturages = () => {
  const [isOpen, setIsOpen] = useState(false)
  const onToggle = () => {
    setIsOpen((prev) => !prev)
  }
  return (
    <header className="top-0 left-0 w-full flex justify-between items-center py-6 px-8 z-10">
      <Logo />
      <MenuDesktop />
      <HamburgerButton isOpen={isOpen} onToggle={onToggle} />
      <MenuMobile isOpen={isOpen} onClose={onToggle} />
    </header>
  )
}
export default HeaderCovoiturages
