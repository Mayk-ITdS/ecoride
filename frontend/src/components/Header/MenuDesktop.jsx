import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthorization from '../../hooks/useAuthorization'

function getSpaceLink(user) {
  if (!user) return null
  const role = user.role || user?.roles?.[0]
  if (role === 'admin') return { to: '/admin', label: 'Espace administratif' }
  if (role === 'employee') return { to: '/employee', label: 'Espace employé' }
  return { to: '/dashboard', label: 'Espace personnel' }
}

export default function MenuDesktop() {
  const { user, logout } = useAuthorization()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      if (location.pathname !== '/login') navigate('/login', { replace: true })
    }
  }

  const space = getSpaceLink(user)

  return (
    <nav
      className="hidden md:flex items-center gap-10 text-white/90 font-medium"
      aria-label="Primary"
    >
      <Link to="/covoiturages" className="hover:text-ecoGreen transition">
        Covoiturages
      </Link>
      <Link to="/contact" className="hover:text-ecoGreen transition">
        Contact
      </Link>

      {user ? (
        <>
          {space && (
            <Link to={space.to} className="hover:text-ecoGreen transition">
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
        <Link to="/login" className="hover:text-ecoGreen transition">
          Log in
        </Link>
      )}
    </nav>
  )
}
