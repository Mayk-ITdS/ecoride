import { Outlet, NavLink } from "react-router-dom";
import { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../../context/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <span className="text-emerald-600 font-bold">EcoRide</span>
            </Link>
            <nav className="flex gap-4 text-sm">
              <NavLink to="/admin" end>
                Dashboard
              </NavLink>
              <NavLink to="/admin/employees">Employés</NavLink>
              <NavLink to="/admin/reviews">Avis</NavLink>
              <NavLink to="/admin/incidents">Incidents</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span>
              Bonjour, <b>{user?.pseudo}</b>
            </span>
            <button
              onClick={logout}
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
