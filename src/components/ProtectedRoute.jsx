import { Navigate } from 'react-router-dom'
import { ROUTES } from '../config/routes'

export default function ProtectedRoute({ children }) {
  const hasTokens = Boolean(localStorage.getItem('sa_access_token') && localStorage.getItem('sa_refresh_token'))
  const isAuth = localStorage.getItem('sa_auth') === 'true' && hasTokens
  return isAuth ? children : <Navigate to={ROUTES.LOGIN} replace />
}
