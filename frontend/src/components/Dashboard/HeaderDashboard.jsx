import { useState } from 'react'
import MenuDesktop from '../Header/MenuDesktop'
import MenuMobile from '../Header/MenuMobile'
import Logo from '../Header/Logo'
import HamburgerButton from '../Header/HamburgerButton'

const HeaderDashboard = () => {
  const [isOpen, setIsOpen] = useState(false)
  const onToggle = () => {
    setIsOpen((prev) => !prev)
  }
  return (
    <header
      className="mx-auto w-full mb-10 flex justify-between items-center py-6 px-8 z-10
             relative rounded-b-xl shadow-lg
             bg-gradient-to-b from-gray-500 to-gray-600"
    >
      <Logo />
      <MenuDesktop />
      <HamburgerButton isOpen={isOpen} onToggle={onToggle} />
      <MenuMobile isOpen={isOpen} onClose={onToggle} />
    </header>
  )
}
export default HeaderDashboard
