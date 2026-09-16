import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isAuth = localStorage.getItem('sa_auth')
    if (!isAuth) { setLoading(false); return }

    authApi.getMe()
      .then(data => setAdmin(data))
      .catch(() => {
        // Token invalid/expired — clear stale auth and let user log in again
        localStorage.removeItem('sa_auth')
        localStorage.removeItem('sa_access_token')
        localStorage.removeItem('sa_refresh_token')
        setAdmin(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const refreshAdmin = async () => {
    try {
      const data = await authApi.getMe()
      setAdmin(data)
      return data
    } catch {
      setAdmin(null)
      return null
    }
  }

  const setAdminDirect = (data) => setAdmin(data)

  const clearAdmin = () => {
    setAdmin(null)
    localStorage.removeItem('sa_auth')
    localStorage.removeItem('sa_access_token')
    localStorage.removeItem('sa_refresh_token')
  }

  return (
    <AuthContext.Provider value={{ admin, loading, refreshAdmin, setAdminDirect, clearAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
