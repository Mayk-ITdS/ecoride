import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthorization from './useAuthorization'
import api from '../services/api'
export default function useAxiosWithAuth() {
  const { token, logout } = useAuthorization()
  const navigate = useNavigate()
  useEffect(() => {
    const reqId = api.interceptors.request.use(
      (config) => {
        const headers = (config.headers = config.headers ?? {})
        if (token) headers.Authorization = `Bearer ${token}`
        else delete headers.Authorization
        config.headers = headers
        return {
          ...config,
          headers,
        }
      },
      (error) => Promise.reject(error),
    )
    const resId = api.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error?.response?.status == 401) {
          console.warn('401 → logout()')
          logout?.()
          if (!location.pathname.startsWith('/login')) {
            navigate('/login')
          }
        }
        return Promise.reject(error)
      },
    )
    return () => {
      api.interceptors.request.eject(reqId)
      api.interceptors.response.eject(resId)
    }
  }, [token, logout])

  return api
}
