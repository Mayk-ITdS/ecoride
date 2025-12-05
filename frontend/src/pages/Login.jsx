import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import HeaderRegister from '@/components/Register/HeaderRegister'
import useAuthorization from '../hooks/useAuthorization'
import api from '../services/api'
const getRoleHomePath = (user) => {
  const role = user?.role || user?.roles?.[0]
  if (role === 'admin') return '/admin'
  if (role === 'employee') return '/employee'
  return '/dashboard'
}

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuthorization()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)

    try {
      console.log('VITE_API_URL =', import.meta.env.VITE_API_URL)
      const { data } = await api.post('/users/login', {
        email: form.email,
        password: form.password,
      })

      const { token, user, roles } = data
      const userWithRoles = { ...user, roles: user?.roles ?? roles ?? [] }
      await login(token, userWithRoles)

      navigate(getRoleHomePath(userWithRoles), { replace: true })
    } catch (error) {
      console.error('Erreur login:', error.response?.data || error)
      alert(error.response?.data?.error || 'Identifiants invalides')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-screen flex flex-col bg-gradient-radial from-green-100 via-green-200 to-green-400 px-4">
      <HeaderRegister />
      <section className="flex flex-1 flex-col justify-center items-center w-full font-display">
        <form
          onSubmit={handleLogin}
          className="relative w-full max-w-2xl flex flex-col gap-6 text-center justify-center"
        >
          <legend className="text-5xl font-bold text-left pb-10 text-gray-800">
            Log <span className="text-ecoPurple">in</span>
          </legend>

          <fieldset className="flex flex-col gap-3">
            <div>
              <label htmlFor="email" className="flex px-3">
                Email
              </label>
              <input
                id="email"
                name="email"
                onChange={handleChange}
                value={form.email}
                type="email"
                placeholder="Email"
                className="w-full px-6 py-6 mb-3 border border-gray-400 rounded-full bg-transparent focus:outline-none focus:ring-2 focus:ring-ecoGreen"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="flex text-left px-3">
                Password
              </label>
              <input
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                type="password"
                placeholder="Password"
                className="w-full px-6 py-6 mb-3 border border-gray-400 rounded-full bg-transparent focus:outline-none focus:ring-2 focus:ring-ecoGreen"
                required
              />
            </div>
          </fieldset>

          <p className="text-xs text-gray-700">
            By continuing, you agree to the{' '}
            <a href="#" className="underline">
              Terms of use
            </a>{' '}
            and{' '}
            <a href="#" className="underline">
              Privacy Policy
            </a>
            .
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 rounded-full bg-ecoPurple text-white font-semibold hover:bg-purple-700 transition disabled:opacity-60"
          >
            {loading ? 'Connexion…' : 'Connexion'}
          </button>

          <p className="text-sm text-gray-700">
            Déjà un compte ?{' '}
            <Link to="/register" className="font-semibold underline">
              Créer un compte
            </Link>
          </p>
        </form>
      </section>
    </section>
  )
}

export default Login
