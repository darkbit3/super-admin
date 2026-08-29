import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../config/routes'
import { authApi } from '../api/authApi'
import { api } from '../api/client'

const ACCENT        = '#7C3AED'
const ACCENT_BG     = 'rgba(124,58,237,0.10)'
const ACCENT_BORDER = 'rgba(124,58,237,0.25)'
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
  const [tab, setTab] = useState('login')   // 'login' | 'register' | 'forgot'

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F0EAF8' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12" style={{ backgroundColor: DARK }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: ACCENT }}>
            <img src="/logo.png" alt="Shmeta" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
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
            <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-3" style={{ backgroundColor: ACCENT }}>
              <img src="/logo.png" alt="Shmeta" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: DARK, fontFamily: 'Georgia, serif' }}>Shmeta</h1>
            <p className="text-xs tracking-widest uppercase font-medium mt-1" style={{ color: ACCENT }}>Super Admin Portal</p>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-xl overflow-hidden mb-4"
            style={{ backgroundColor: '#fff', border: `1px solid ${ACCENT_BORDER}` }}>
            {[['login', 'Sign In'], ['register', 'Register']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="flex-1 py-2.5 text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor: tab === key ? DARK : 'transparent',
                  color: tab === key ? '#F0EAF8' : '#7A6A8A',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'login'    && <LoginForm    onForgot={() => setTab('forgot')} />}
          {tab === 'register' && <RegisterInfo />}
          {tab === 'forgot'   && <ForgotFlow   onBack={() => setTab('login')} />}
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
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-1-khts.onrender.com/api'
    fetch(`${BASE_URL.replace(/\/api$/, '')}/health`).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const loginInput = username.trim()
    if (!loginInput) { setError('Please enter your username or phone number'); return }
    setError(''); setLoading(true)
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
    <div className="bg-white rounded-2xl shadow-lg p-8" style={{ border: '1px solid #DDD0F0' }}>
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: DARK }}>Super Admin Sign In</h2>
        <p className="text-sm mt-1" style={{ color: '#7A6A8A' }}>Enter your credentials to access full control.</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#3A2A4A' }}>Username or Phone</label>
          <input
            type="text" value={username} onChange={e => setUsername(e.target.value)}
            placeholder="Enter username or phone" required
            className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none"
            style={{ borderColor: '#DDD0F0', color: DARK }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#3A2A4A' }}>Password</label>
          <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: '#DDD0F0' }}>
            <input
              type={showPassword ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
              className="flex-1 px-4 py-2.5 text-sm outline-none bg-white" style={{ color: DARK }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-3" style={{ color: '#A090B0' }}>
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        {/* Forgot — super admins can also reset via phone */}
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
// Register info
// ═══════════════════════════════════════════════════════════════════════════
function RegisterInfo() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center" style={{ border: '1px solid #DDD0F0' }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: ACCENT_BG }}>
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke={ACCENT} strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold mb-2" style={{ color: DARK }}>New Super Admin Account</h3>
      <p className="text-sm mb-4" style={{ color: '#7A6A8A', lineHeight: 1.6 }}>
        Super Admin accounts are provisioned directly in the system.<br />
        Contact the <strong>system developer</strong> to register a new super admin.
      </p>
      <div className="rounded-xl p-4 text-left text-sm" style={{ backgroundColor: ACCENT_BG, border: `1px solid ${ACCENT_BORDER}` }}>
        <div className="flex gap-2">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke={ACCENT} strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span style={{ color: '#4A3A6A' }}>
            Super admins are pre-configured during system setup. Self-registration is not available for security reasons.
          </span>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Forgot password flow: phone → OTP → new password → done
// ═══════════════════════════════════════════════════════════════════════════
function ForgotFlow({ onBack }) {
  const [step, setStep]     = useState('phone')
  const [devOtp, setDevOtp] = useState(null)
  const phone = usePhoneInput()

  const [phoneLoading, setPhoneLoading] = useState(false)
  const [phoneError,   setPhoneError]   = useState('')

  const [otp,         setOtp]       = useState('')
  const [newPass,     setNewPass]   = useState('')
  const [confirmPass, setConfirm]   = useState('')
  const [showNew,     setShowNew]   = useState(false)
  const [showConf,    setShowConf]  = useState(false)
  const [otpLoading,  setOtpLoading] = useState(false)
  const [otpError,    setOtpError]  = useState('')

  const submitPhone = async (e) => {
    e.preventDefault()
    if (!phone.valid) { setPhoneError('Enter a valid 10-digit phone number starting with 09 or 07'); return }
    setPhoneError(''); setPhoneLoading(true)
    try {
      const res = await api.post('/user-auth/forgot-password/check-phone', { phone: phone.full })
      setDevOtp(res?.data?.otp ?? null)
      setStep('otp')
    } catch (err) {
      setPhoneError(err.message || 'Phone not found. Please check and try again.')
    } finally {
      setPhoneLoading(false)
    }
  }

  const submitOtp = async (e) => {
    e.preventDefault()
    if (otp.length !== 6)        { setOtpError('OTP must be exactly 6 digits'); return }
    if (newPass.length < 6)      { setOtpError('Password must be at least 6 characters'); return }
    if (newPass !== confirmPass) { setOtpError('Passwords do not match'); return }
    setOtpError(''); setOtpLoading(true)
    try {
      await api.post('/user-auth/forgot-password/verify-otp', { phone: phone.full, otp, newPassword: newPass })
      setStep('done')
    } catch (err) {
      setOtpError(err.message || 'Invalid or expired OTP.')
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
          <p className="text-sm mt-1" style={{ color: '#7A6A8A' }}>Code sent to {phone.full} — enter it below.</p>
        </div>

        {devOtp && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.4)', color: '#92400e' }}>
            Dev mode — OTP: {devOtp}
          </div>
        )}

        {otpError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{otpError}</div>
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
            onClick={() => { setStep('phone'); setOtp(''); setNewPass(''); setConfirm(''); setOtpError('') }}
            className="w-full text-sm font-medium py-2 hover:underline" style={{ color: ACCENT }}>
            ← Resend Code
          </button>
        </form>
      </div>
    )
  }

  // Phone step
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8" style={{ border: '1px solid #DDD0F0' }}>
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: DARK }}>Forgot Password</h2>
        <p className="text-sm mt-1" style={{ color: '#7A6A8A' }}>Enter your phone number to receive a verification code.</p>
      </div>

      {phoneError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{phoneError}</div>
      )}

      <form onSubmit={submitPhone} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#3A2A4A' }}>Phone Number</label>
          <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: '#DDD0F0' }}>
            <span className="px-3 py-2.5 text-sm font-semibold select-none"
              style={{ backgroundColor: ACCENT_BG, color: ACCENT, borderRight: `1px solid ${ACCENT_BORDER}` }}>0</span>
            <input
              type="tel" value={phone.raw} onChange={phone.onChange}
              placeholder="9xxxxxxxx  or  7xxxxxxxx"
              inputMode="numeric" maxLength={9} autoFocus
              className="flex-1 px-3 py-2.5 text-sm outline-none bg-white" style={{ color: DARK }}
            />
          </div>
        </div>

        <button type="submit" disabled={phoneLoading}
          className="w-full font-semibold py-2.5 rounded-lg transition-all disabled:opacity-60"
          style={{ backgroundColor: DARK, color: '#F0EAF8' }}>
          {phoneLoading ? 'Checking…' : 'Send OTP'}
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
