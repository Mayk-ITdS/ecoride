import { useCallback, useEffect, useId, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Logo from './Logo'
import MenuDesktop from './MenuDesktop'
import MenuMobile from './MenuMobile'
import HamburgerButton from './HamburgerButton'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const menuId = useId()

  const onToggle = useCallback(() => setIsOpen((prev) => !prev), [])
  const onClose = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    onClose()
  }, [location.pathname])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <header className="absolute top-0 left-0 w-full flex justify-between items-center py-6 px-8 z-10">
      <Logo />
      <MenuDesktop />
      <HamburgerButton
        isOpen={isOpen}
        onToggle={onToggle}
        ariaControls={menuId}
      />
      <MenuMobile isOpen={isOpen} onClose={onClose} menuId={menuId} />
    </header>
  )
}
