import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../config/routes'
import { authApi } from '../api/authApi'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'

const ACCENT        = '#7C3AED'
const DARK          = '#1A0A2E'

// ── phone helpers ──────────────────────────────────────────────────────────
function usePhoneInput() {
  const [raw, setRaw] = useState('')
  const full  = raw ? '0' + raw : ''
  const valid = raw.length === 9 && (raw[0] === '9' || raw[0] === '7')

  const onChange = (e) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.startsWith('0')) v = v.slice(1)
    if (v.length === 1 && v !== '9' && v !== '7') return
    if (v.length > 9) return
    setRaw(v)
  }

  return { raw, full, valid, onChange }
}

// ═══════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════
export default function Login() {
  const [tab, setTab] = useState('login')   // 'login' | 'forgot'

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F0EAF8' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12" style={{ backgroundColor: DARK }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white shadow-md flex items-center justify-center p-1 overflow-hidden flex-shrink-0 border border-purple-200/30">
            <img src="/logo.png" alt="Shmeta Super Admin" className="w-full h-full object-contain" />
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

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-md flex items-center justify-center p-2 mx-auto mb-3 overflow-hidden border border-purple-200/30">
              <img src="/logo.png" alt="Shmeta Super Admin" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: DARK, fontFamily: 'Georgia, serif' }}>Shmeta</h1>
            <p className="text-xs tracking-widest uppercase font-medium mt-1" style={{ color: ACCENT }}>Super Admin Portal</p>
          </div>

          {tab === 'login'  && <LoginForm  onForgot={() => setTab('forgot')} />}
          {tab === 'forgot' && <ForgotFlow onBack={() => setTab('login')} />}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Login form (username or phone)
// ═══════════════════════════════════════════════════════════════════════════
function LoginForm({ onForgot }) {
  const [username, setUsername]         = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    const BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-1-khts.onrender.com/api'
    fetch(`${BASE_URL.replace(/\/api$/, '')}/health`).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const loginInput = username.trim()
    if (!loginInput) { toast.error('Please enter your username or phone number'); return }
    setLoading(true)

    // Detect if input is phone number (numeric) or username (alphabetic/alphanumeric)
    const hasLetters = /[a-zA-Z]/.test(loginInput)
    const digitsOnly = loginInput.replace(/[\s\-().+]/g, '')
    const isPhone = !hasLetters && digitsOnly.length >= 3 && /^\d+$/.test(digitsOnly)

    const expectedAuthError = isPhone
      ? 'Invalid phone number or password'
      : 'Invalid username or password'

    try {
      const admin = await authApi.login(loginInput, password)

      // Strict case-sensitive check on username
      if (!isPhone && admin) {
        const matchesExactCase =
          (admin.name && admin.name === loginInput) ||
          (admin.phone && admin.phone === loginInput)

        if (!matchesExactCase) {
          await authApi.logout().catch(() => {})
          toast.error('Invalid username or password')
          return
        }
      }

      navigate(ROUTES.DASHBOARD)
    } catch (err) {
      const msg = err.message || ''
      const isAuthError =
        !err.status ||
        err.status === 401 ||
        /invalid/i.test(msg) ||
        /phone/i.test(msg) ||
        /password/i.test(msg) ||
        /username/i.test(msg) ||
        /credentials/i.test(msg)

      if (isAuthError) {
        toast.error(expectedAuthError)
      } else {
        toast.error(msg || expectedAuthError)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8" style={{ border: '1px solid #DDD0F0' }}>
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: DARK }}>Super Admin Sign In</h2>
        <p className="text-sm mt-1" style={{ color: '#7A6A8A' }}>Enter your credentials to access full control.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-username" className="block text-sm font-medium mb-1.5" style={{ color: '#3A2A4A' }}>Username or Phone</label>
          <input
            id="login-username"
            type="text" value={username} onChange={e => setUsername(e.target.value)}
            placeholder="Enter username or phone" required
            className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none"
            style={{ borderColor: '#DDD0F0', color: DARK }}
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-sm font-medium mb-1.5" style={{ color: '#3A2A4A' }}>Password</label>
          <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: '#DDD0F0' }}>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
              className="flex-1 px-4 py-2.5 text-sm outline-none bg-white" style={{ color: DARK }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-3" style={{ color: '#A090B0' }}>
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        {/* Forgot — super admins reset via email */}
        <div className="text-right">
          <button type="button" onClick={onForgot} className="text-sm font-medium hover:underline" style={{ color: ACCENT }}>
            Forgot password?
          </button>
        </div>

        <button type="submit" disabled={loading}
          className="w-full font-semibold py-2.5 rounded-lg transition-all duration-150 disabled:opacity-60"
          style={{ backgroundColor: DARK, color: '#F0EAF8' }}
          onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = ACCENT)}
          onMouseLeave={e => !loading && (e.currentTarget.style.backgroundColor = DARK)}>
          {loading ? 'Signing in…' : 'Sign In as Super Admin'}
        </button>
      </form>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Forgot password flow: email → OTP → new password → done
// ═══════════════════════════════════════════════════════════════════════════
function ForgotFlow({ onBack }) {
  const [step, setStep]     = useState('email')
  const [devOtp, setDevOtp] = useState(null)
  const [email, setEmail] = useState('')

  const [emailLoading, setEmailLoading] = useState(false)

  const [otp,         setOtp]       = useState('')
  const [newPass,     setNewPass]   = useState('')
  const [confirmPass, setConfirm]   = useState('')
  const [showNew,     setShowNew]   = useState(false)
  const [showConf,    setShowConf]  = useState(false)
  const [otpLoading,  setOtpLoading] = useState(false)
  const toast = useToast()

  const submitEmail = async (e) => {
    e.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      toast.error('Enter a valid email address')
      return
    }
    setEmail(normalizedEmail); setEmailLoading(true)
    try {
      const res = await api.post('/super-auth/forgot-password/check-email', { email: normalizedEmail }, { refreshOnUnauthorized: false })
      setDevOtp(res?.data?.otp ?? null)
      setStep('otp')
    } catch (err) {
      toast.error(err.message || 'Email not found. Please check and try again.')
    } finally {
      setEmailLoading(false)
    }
  }

  const submitOtp = async (e) => {
    e.preventDefault()
    if (otp.length !== 6)        { toast.error('OTP must be exactly 6 digits'); return }
    if (newPass.length < 6)      { toast.error('Password must be at least 6 characters'); return }
    if (newPass !== confirmPass) { toast.error('Passwords do not match'); return }
    setOtpLoading(true)
    try {
      await api.post('/super-auth/forgot-password/verify-otp', { email, otp, newPassword: newPass }, { refreshOnUnauthorized: false })
      toast.success('Password reset successfully')
      setStep('done')
    } catch (err) {
      toast.error(err.message || 'Invalid or expired OTP.')
    } finally {
      setOtpLoading(false)
    }
  }

  if (step === 'done') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center" style={{ border: '1px solid #DDD0F0' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold mb-2" style={{ color: DARK }}>Password Reset!</h3>
        <p className="text-sm mb-6" style={{ color: '#7A6A8A' }}>
          Your password has been reset. Sign in with your new password.
        </p>
        <button onClick={onBack} className="w-full font-semibold py-2.5 rounded-lg"
          style={{ backgroundColor: DARK, color: '#F0EAF8' }}>
          Back to Sign In
        </button>
      </div>
    )
  }

  if (step === 'otp') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8" style={{ border: '1px solid #DDD0F0' }}>
        <div className="mb-5">
          <h2 className="text-lg font-bold" style={{ color: DARK }}>Verification Code</h2>
          <p className="text-sm mt-1" style={{ color: '#7A6A8A' }}>Code sent to {email} — enter it below.</p>
        </div>

        {devOtp && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.4)', color: '#92400e' }}>
            Dev mode — OTP: {devOtp}
          </div>
        )}

        <form onSubmit={submitOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#3A2A4A' }}>Verification Code</label>
            <input
              type="text" value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="• • • • • •" maxLength={6} inputMode="numeric" autoFocus
              className="w-full border rounded-lg px-4 py-3 text-center text-2xl font-bold tracking-widest outline-none"
              style={{ borderColor: '#DDD0F0', color: DARK, letterSpacing: '0.5em' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#3A2A4A' }}>New Password</label>
            <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: '#DDD0F0' }}>
              <input
                type={showNew ? 'text' : 'password'} value={newPass}
                onChange={e => setNewPass(e.target.value)} placeholder="••••••••"
                className="flex-1 px-4 py-2.5 text-sm outline-none bg-white" style={{ color: DARK }}
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="px-3" style={{ color: '#A090B0' }}>
                <EyeIcon open={showNew} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#3A2A4A' }}>Confirm Password</label>
            <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: '#DDD0F0' }}>
              <input
                type={showConf ? 'text' : 'password'} value={confirmPass}
                onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
                className="flex-1 px-4 py-2.5 text-sm outline-none bg-white" style={{ color: DARK }}
              />
              <button type="button" onClick={() => setShowConf(!showConf)} className="px-3" style={{ color: '#A090B0' }}>
                <EyeIcon open={showConf} />
              </button>
            </div>
          </div>

          <button type="submit" disabled={otpLoading}
            className="w-full font-semibold py-2.5 rounded-lg transition-all disabled:opacity-60"
            style={{ backgroundColor: DARK, color: '#F0EAF8' }}>
            {otpLoading ? 'Resetting…' : 'Reset Password'}
          </button>

          <button type="button"
            onClick={() => { setStep('email'); setOtp(''); setNewPass(''); setConfirm('') }}
            className="w-full text-sm font-medium py-2 hover:underline" style={{ color: ACCENT }}>
            ← Resend Code
          </button>
        </form>
      </div>
    )
  }

  // Email step
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8" style={{ border: '1px solid #DDD0F0' }}>
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: DARK }}>Forgot Password</h2>
        <p className="text-sm mt-1" style={{ color: '#7A6A8A' }}>Enter your email to receive a verification code.</p>
      </div>

      <form onSubmit={submitEmail} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#3A2A4A' }}>Email Address</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="admin@example.com" autoFocus required
            className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none bg-white" style={{ borderColor: '#DDD0F0', color: DARK }}
          />
        </div>

        <button type="submit" disabled={emailLoading}
          className="w-full font-semibold py-2.5 rounded-lg transition-all disabled:opacity-60"
          style={{ backgroundColor: DARK, color: '#F0EAF8' }}>
          {emailLoading ? 'Checking…' : 'Send OTP'}
        </button>

        <button type="button" onClick={onBack}
          className="w-full text-sm font-medium py-2 hover:underline" style={{ color: ACCENT }}>
          ← Back to Sign In
        </button>
      </form>
    </div>
  )
}

// ── Eye icon ───────────────────────────────────────────────────────────────
function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}
