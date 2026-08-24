import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../config/routes'
import { authApi } from '../api/authApi'

const ACCENT = '#7C3AED'

export default function Login() {
  const [username, setUsername]         = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const BASE_URL = import.meta.env.VITE_API_URL || 'https://yonas-backend.onrender.com/api'
    fetch(`${BASE_URL.replace(/\/api$/, '')}/health`).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const loginInput = username.trim()
    if (!loginInput) {
      setError('Please enter your username or phone number')
      return;
    }
    setError('')
    setLoading(true)
    try {
      await authApi.login(loginInput, password)
      navigate(ROUTES.DASHBOARD)
    } catch (err) {
      setError(err.message || 'Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F0EAF8' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12" style={{ backgroundColor: '#1A0A2E' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: ACCENT }}>
            <img src="/logo.png" alt="Shmeta" className="w-full h-full object-cover" onError={e => { e.target.style.display='none' }} />
          </div>
          <span className="text-lg font-bold tracking-wide" style={{ color: '#F0EAF8', fontFamily: 'Georgia, serif' }}>Shmeta</span>
        </div>
        <div>
          <p className="text-4xl font-bold leading-snug mb-4" style={{ color: '#F0EAF8', fontFamily: 'Georgia, serif' }}>
            System<br />
            <span style={{ color: ACCENT }}>Super Admin</span><br />
            Portal
          </p>
          <p className="text-sm" style={{ color: '#7A6A8A' }}>Global platform administration & management.</p>
        </div>
        <p className="text-xs" style={{ color: '#4A3A5A' }}>© {new Date().getFullYear()} Shmeta. All rights reserved.</p>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-3" style={{ backgroundColor: ACCENT }}>
              <img src="/logo.png" alt="Shmeta" className="w-full h-full object-cover" onError={e => { e.target.style.display='none' }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#1A0A2E', fontFamily: 'Georgia, serif' }}>Shmeta</h1>
            <p className="text-xs tracking-widest uppercase font-medium mt-1" style={{ color: ACCENT }}>Super Admin Portal</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8" style={{ border: '1px solid #DDD0F0' }}>
            <div className="mb-7">
              <h2 className="text-xl font-bold" style={{ color: '#1A0A2E' }}>Super Admin Sign In</h2>
              <p className="text-sm mt-1" style={{ color: '#7A6A8A' }}>Enter your credentials to access full control.</p>
            </div>

            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username / Phone */}
              <div>
                <label htmlFor="super-admin-username" className="block text-sm font-medium mb-1.5" style={{ color: '#3A2A4A' }}>Username or Phone</label>
                <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: '#DDD0F0' }}>
                  <input
                    id="super-admin-username" type="text" value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="Enter username (e.g. yonas) or phone" required
                    className="flex-1 px-4 py-2.5 text-sm outline-none bg-white" style={{ color: '#1A0A2E' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="super-admin-password" className="block text-sm font-medium mb-1.5" style={{ color: '#3A2A4A' }}>Password</label>
                <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: '#DDD0F0' }}>
                  <input
                    id="super-admin-password" type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    className="flex-1 px-4 py-2.5 text-sm outline-none bg-white" style={{ color: '#1A0A2E' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-3 transition-colors" style={{ color: '#A090B0' }} aria-label={showPassword ? 'Hide' : 'Show'}>
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full font-semibold py-2.5 rounded-lg transition-all duration-150 disabled:opacity-60"
                style={{ backgroundColor: '#1A0A2E', color: '#F0EAF8' }}
                onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = ACCENT)}
                onMouseLeave={e => !loading && (e.currentTarget.style.backgroundColor = '#1A0A2E')}>
                {loading ? 'Signing in…' : 'Sign In as Super Admin'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
