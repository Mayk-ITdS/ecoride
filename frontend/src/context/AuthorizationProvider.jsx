import { useState, useEffect, useMemo } from 'react'
import AuthContext from './AuthContext'
import api from '../services/api'

export default function AuthorizationProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user')
      return saved && saved !== 'undefined' ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const run = async () => {
      try {
        if (!token) {
          setReady(true)
          return
        }
        const { data } = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (data && typeof data === 'object') {
          setUser(data)
          localStorage.setItem('user', JSON.stringify(data))
        } else {
          throw new Error('Réponse /users/me invalide')
        }
      } catch {
        setUser(null)
        setToken(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } finally {
        setReady(true)
      }
    }
    run()
  }, [token, api])

  const login = (newToken, userData) => {
    setToken(newToken)
    localStorage.setItem('token', newToken)
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ token, user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
