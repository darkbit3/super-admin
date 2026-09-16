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
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false))
  }, [])

  const refreshAdmin = async () => {
    try {
      const data = await authApi.getMe()
      setAdmin(data)
    } catch { setAdmin(null) }
  }

  const clearAdmin = () => setAdmin(null)

  return (
    <AuthContext.Provider value={{ admin, loading, refreshAdmin, clearAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
