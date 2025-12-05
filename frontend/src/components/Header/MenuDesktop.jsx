import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthorization from '../../hooks/useAuthorization'

const MenuDesktop = () => {
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
          <Link to="/dashboard" className="hover:text-ecoGreen transition">
            Espace&nbsp;Personnel
          </Link>
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
export default MenuDesktop
