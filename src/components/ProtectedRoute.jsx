import { Navigate } from 'react-router-dom'
import { ROUTES } from '../config/routes'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth()

  if (loading) return null  // wait for auth check to complete

  return admin ? children : <Navigate to={ROUTES.LOGIN} replace />
}
