import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import useAuthorization from '../../hooks/useAuthorization'

function getSpaceLink(user) {
  if (!user) return null
  const role = user.role || user?.roles?.[0]
  if (role === 'admin') return { to: '/admin', label: 'Espace administratif' }
  if (role === 'employee') return { to: '/employee', label: 'Espace employé' }
  return { to: '/dashboard', label: 'Espace personnel' }
}

export default function MenuMobile({ isOpen, onClose, menuId }) {
  const panelRef = useRef(null)
  const { user, logout } = useAuthorization()
  const space = getSpaceLink(user)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    const { body } = document
    const prev = body.style.overflow
    body.style.overflow = 'hidden'

    const firstLink = panelRef.current?.querySelector('a')
    if (firstLink) firstLink.focus()

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      body.style.overflow = prev
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      onClose()
      window.location.assign('/login')
    }
  }

  return (
    <div
      ref={panelRef}
      id={menuId}
      className="absolute top-full left-0 w-full bg-ecoGray/90 backdrop-blur-md md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile menu"
    >
      <nav className="flex flex-col items-center gap-6 py-8 text-lg text-white font-medium">
        <Link
          to="/covoiturages"
          className="hover:text-ecoGreen transition"
          onClick={onClose}
        >
          Covoiturages
        </Link>
        <Link
          to="/contact"
          className="hover:text-ecoGreen transition"
          onClick={onClose}
        >
          Contact
        </Link>
        {user ? (
          <>
            {space && (
              <Link
                to={space.to}
                className="hover:text-ecoGreen transition"
                onClick={onClose}
              >
                {space.label}
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="hover:text-ecoGreen transition"
            >
              Log out
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="hover:text-ecoGreen transition"
            onClick={onClose}
          >
            Log in
          </Link>
        )}
      </nav>
    </div>
  )
}
