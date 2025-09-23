import { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import AuthContext from '../../context/AuthContext'

export default function RequireRole({ roles = [], children }) {
  const auth = useContext(AuthContext)
  console.log('AUTH CTX =', auth)

  const { user, ready } = auth ?? {}
  const location = useLocation()

  if (!ready) return null

  const userObj = user && typeof user === 'object' ? user : null

  if (!userObj) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const userRoles = Array.isArray(userObj.roles)
    ? userObj.roles
    : userObj.role
      ? [userObj.role]
      : []

  if (!roles.some((r) => userRoles.includes(r))) {
    return <Navigate to="/403" replace />
  }
  return children
}
