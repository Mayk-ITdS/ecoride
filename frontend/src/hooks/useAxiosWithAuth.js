import axios from 'axios'
import { useEffect, useMemo } from 'react'
import useAuthorization from './useAuthorization'

export default function useAxiosWithAuth() {
  const { token, logout } = useAuthorization()
  const api = useMemo(() => {
    return axios.create({
      baseURL: import.meta.env?.VITE_API_URL ?? '/api',
    })
  }, [])

  useEffect(() => {
    const reqId = api.interceptors.request.use((config) => {
      if (token) {
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${token}`
      } else if (config?.headers?.Authorization) {
        delete config.headers.Authorization
      }
      console.log(
        '[REQ]',
        config.baseURL + config.url,
        'Auth:',
        !!config.headers.Authorization,
      )
      return config
    })

    const resId = api.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error?.response?.status === 401) {
          console.warn('401 → logout()')
          logout?.()
          window.location.assign('/login')
        }
        return Promise.reject(error)
      },
    )
    return () => {
      api.interceptors.request.eject(reqId)
      api.interceptors.response.eject(resId)
    }
  }, [api, token, logout])

  return api
}
