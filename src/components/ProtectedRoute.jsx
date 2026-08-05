import { Navigate } from 'react-router-dom'
import { ROUTES } from '../config/routes'

export default function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem('sa_auth') === 'true'
  return isAuth ? children : <Navigate to={ROUTES.LOGIN} replace />
}
