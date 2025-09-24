import { Link } from 'react-router-dom'
export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-8 text-center">
        <div className="text-5xl mb-3">🚫</div>
        <h1 className="text-2xl font-semibold mb-2">Accès refusé (403)</h1>
        <p className="text-gray-600 mb-6">
          Vous n’avez pas les droits nécessaires.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
          >
            Accueil
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  )
}
