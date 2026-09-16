import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../config/routes'
import { authApi } from '../api/authApi'
import { api, warmUp } from '../api/client'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/Loaders'

const ACCENT = '#7C3AED'
const DARK = '#120726'

export default function Login() {
  const [tab, setTab] = useState('login') // 'login' | 'forgot'
  const { admin, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && admin) {
      navigate(ROUTES.DASHBOARD, { replace: true })
    }
  }, [admin, loading, navigate])

  if (loading || admin) return null

  return (
    <div className="min-h-screen flex bg-[#F6F2FB]">
      {/* Left luxury decorative panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-5/12 p-12 relative overflow-hidden text-white"
        style={{ backgroundColor: DARK }}
      >
        {/* Ambient radial glows */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl" />

        {/* Top Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white shadow-lg shadow-purple-950/40 flex items-center justify-center p-1.5 overflow-hidden flex-shrink-0 border border-purple-200/40">
            <img src="/logo.png" alt="Shmeta Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-display font-bold text-xl tracking-tight text-white">Shmeta</span>
            <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/30">
              Super Admin
            </span>
          </div>
        </div>

        {/* Center Value Proposition */}
        <div className="relative z-10 my-auto py-8">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-purple-200 border border-white/10 mb-4 backdrop-blur-sm">
            Platform Operations & Management
          </span>
          <h1 className="font-display text-4xl xl:text-5xl font-extrabold leading-tight mb-4 tracking-tight">
            Centralized Control.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-300">
              Absolute Integrity.
            </span>
          </h1>
          <p className="text-sm text-purple-200/70 max-w-md leading-relaxed mb-8">
            Manage admins, configure real-time fees, oversee cross-role communications, and audit platform activities with complete governance.
          </p>

          <div className="space-y-3">
            {[
              'Comprehensive Admin & User Authority',
              'Real-Time Role Provisioning & Fee Rules',
              'Audit Logs & Encrypted Chat Systems',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-purple-200/90 font-medium">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-400/40 flex items-center justify-center text-violet-300 flex-shrink-0">
                  ✓
                </span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-purple-300/40">
          <span>© {new Date().getFullYear()} Shmeta Inc. All rights reserved.</span>
          <span>v2.4.0-prod</span>
        </div>
      </div>

      {/* Right Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center p-2 mx-auto mb-3 overflow-hidden border border-purple-200/40">
              <img src="/logo.png" alt="Shmeta Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-display text-2xl font-bold text-[#120726]">Shmeta</h1>
            <p className="text-xs tracking-widest uppercase font-semibold text-violet-600 mt-1">Super Admin Portal</p>
          </div>

          {/* Tab Content */}
          {tab === 'login' && <LoginForm onForgot={() => setTab('forgot')} />}
          {tab === 'forgot' && <ForgotFlow onBack={() => setTab('login')} />}
        </div>
      </div>
    </div>
  )
}

function LoginForm({ onForgot }) {
  const [inputValue, setInputValue] = useState('')
  const [isPhoneMode, setIsPhoneMode] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  // Silently warm up the server in the background on page load
  useEffect(() => {
    const controller = new AbortController()
    warmUp(controller.signal)
    return () => controller.abort()
  }, [])

  const handleInputChange = (e) => {
    const val = e.target.value

    if (isPhoneMode) {
      if (!val) {
        setInputValue('')
        setIsPhoneMode(false)
        return
      }

      let digits = val.replace(/\D/g, '')
      if (digits.startsWith('251')) digits = digits.slice(3)
      if (digits.startsWith('0')) digits = digits.slice(1)

      if (digits.length >= 1 && digits[0] !== '9' && digits[0] !== '7') {
        return
      }

      if (digits.length > 9) {
        digits = digits.slice(0, 9)
      }

      setInputValue(digits)
      return
    }

    if (!val) {
      setInputValue('')
      return
    }

    const trimmed = val.trim()
    const digitsOnly = trimmed.replace(/\D/g, '')

    if (trimmed.startsWith('+251') || (trimmed.startsWith('251') && digitsOnly.length > 3)) {
      let digits = digitsOnly.startsWith('251') ? digitsOnly.slice(3) : digitsOnly
      if (digits.startsWith('0')) digits = digits.slice(1)
      if (digits.length === 0 || digits[0] === '9' || digits[0] === '7') {
        setIsPhoneMode(true)
        setInputValue(digits.slice(0, 9))
        return
      }
    } else if (/^\d/.test(trimmed)) {
      let digits = digitsOnly
      if (digits.startsWith('0')) digits = digits.slice(1)

      if (digits.length === 0) {
        setIsPhoneMode(true)
        setInputValue('')
        return
      }

      if (digits[0] === '9' || digits[0] === '7') {
        setIsPhoneMode(true)
        setInputValue(digits.slice(0, 9))
        return
      } else {
        return
      }
    }

    setInputValue(val)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const loginInput = inputValue.trim()
    if (!loginInput) {
      const emptyMsg = isPhoneMode ? 'Please enter your phone number' : 'Please enter your username or phone number'
      setError(emptyMsg)
      toast?.error?.(emptyMsg)
      return
    }

    if (isPhoneMode) {
      if (loginInput.length !== 9 || (loginInput[0] !== '9' && loginInput[0] !== '7')) {
        const phoneFormatMsg = 'Phone number must start with 9 or 7 and be exactly 9 digits'
        setError(phoneFormatMsg)
        toast?.error?.(phoneFormatMsg)
        return
      }
    }

    setError('')
    setLoading(true)

    const identifierToSend = isPhoneMode ? '0' + loginInput : loginInput
    const isPhone = isPhoneMode || (!/[a-zA-Z]/.test(loginInput) && /^\d+$/.test(loginInput.replace(/\D/g, '')))

    const expectedAuthError = isPhone
      ? 'Invalid phone number or password'
      : 'Invalid username or password'

    try {
      const admin = await authApi.login(identifierToSend, password)

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

      const finalError = isAuthError ? expectedAuthError : (msg || expectedAuthError)
      setError(finalError)
      toast?.error?.(finalError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-purple-950/5 p-8 sm:p-10 border border-purple-100">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-extrabold text-[#120726] tracking-tight">Welcome Back</h2>
        <p className="text-sm text-purple-900/60 mt-1 font-medium">Authenticate to access Super Admin commands.</p>
      </div>

      {error && (
        <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-username" className="block text-xs font-bold uppercase tracking-wider text-purple-900/70">
              {isPhoneMode ? 'Phone Number' : 'Username or Phone'}
            </label>
            <button
              type="button"
              onClick={() => {
                setIsPhoneMode(!isPhoneMode)
                setInputValue('')
                setError('')
              }}
              className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors"
            >
              {isPhoneMode ? 'Switch to Username' : 'Use Phone (+251)'}
            </button>
          </div>

          <div className="flex items-center border rounded-xl overflow-hidden transition-all duration-150 focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 border-purple-200/80 bg-purple-50/20">
            {isPhoneMode && (
              <span className="px-3.5 py-2.5 text-sm font-bold select-none flex items-center gap-1 bg-purple-100/60 text-purple-900 border-r border-purple-200/80">
                <span>251</span>
              </span>
            )}
            <input
              id="login-username"
              aria-label="Username or Phone"
              type={isPhoneMode ? 'tel' : 'text'}
              inputMode={isPhoneMode ? 'numeric' : 'text'}
              value={inputValue}
              onChange={handleInputChange}
              placeholder={isPhoneMode ? '9xxxxxxxx or 7xxxxxxxx' : 'Enter username or phone'}
              maxLength={isPhoneMode ? 9 : undefined}
              required
              className={`flex-1 px-3.5 py-2.5 text-sm outline-none bg-transparent text-[#120726] ${
                isPhoneMode ? 'font-mono tracking-wider font-medium' : ''
              }`}
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => {
                  setInputValue('')
                  if (isPhoneMode) setIsPhoneMode(false)
                }}
                className="px-3 text-xs text-purple-400 hover:text-purple-700 transition-colors"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>

          {isPhoneMode && (
            <p className="text-[11px] mt-1.5 text-violet-600 font-medium">
              Must start with 9 or 7 ({inputValue.length}/9 digits)
            </p>
          )}
        </div>

        <div>
          <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-purple-900/70 mb-1.5">
            Password
          </label>
          <div className="flex items-center border rounded-xl overflow-hidden transition-all duration-150 focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 border-purple-200/80 bg-purple-50/20">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="flex-1 px-3.5 py-2.5 text-sm outline-none bg-transparent text-[#120726]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="px-3 text-purple-400 hover:text-purple-700 transition-colors"
              aria-label="Toggle password visibility"
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgot}
            className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 font-bold py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white shadow-lg shadow-violet-500/25 active:scale-[0.99] transition-all duration-150 disabled:opacity-80 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Spinner size="sm" className="border-white/30 border-t-white" />
              <span>
                {elapsed < 4
                  ? 'Authenticating…'
                  : elapsed < 12
                  ? `Starting up… ${elapsed}s`
                  : `Server waking up… ${elapsed}s`}
              </span>
            </>
          ) : (
            <span>Sign In to Super Admin</span>
          )}
        </button>

        {/* Show warm-up notice after 4 seconds */}
        {loading && elapsed >= 4 && (
          <p className="text-center text-xs text-violet-500/80 mt-2 animate-pulse font-medium">
            {elapsed < 12
              ? '⚡ Server is starting up — almost ready…'
              : '🚀 Server is waking up from sleep (free tier). This takes up to 30s once.'}
          </p>
        )}

        {/* Server ready indicator */}
        {!loading && serverReady && (
          <p className="text-center text-[11px] text-emerald-600 mt-1.5 font-medium">
            ✓ Server is ready
          </p>
        )}

      </form>
    </div>
  )
}

function ForgotFlow({ onBack }) {
  const [step, setStep] = useState('email')
  const [devOtp, setDevOtp] = useState(null)
  const [email, setEmail] = useState('')

  const [emailLoading, setEmailLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0)

  const [otp, setOtp] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirm] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (resendCooldown <= 0) return undefined
    const timer = setInterval(() => setResendCooldown((value) => Math.max(0, value - 1)), 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  useEffect(() => {
    if (step !== 'otp' || otpSecondsLeft <= 0) return undefined
    const timer = setInterval(() => setOtpSecondsLeft((value) => Math.max(0, value - 1)), 1000)
    return () => clearInterval(timer)
  }, [step, otpSecondsLeft])

  const sendOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      toast.error('Enter a valid email address')
      return
    }
    setEmail(normalizedEmail)
    setEmailLoading(true)
    try {
      const res = await api.post(
        '/super-auth/forgot-password/check-email',
        { email: normalizedEmail },
        { refreshOnUnauthorized: false }
      )
      setDevOtp(res?.data?.otp ?? null)
      setOtp('')
      setOtpSecondsLeft(res?.data?.expiresInSeconds ?? 600)
      setResendCooldown(30)
      setStep('otp')
      toast.success('A new verification code was sent to your email')
    } catch (err) {
      toast.error(err.message || 'Unable to send verification code.')
    } finally {
      setEmailLoading(false)
    }
  }

  const submitEmail = async (e) => {
    e.preventDefault()
    await sendOtp()
  }

  const submitOtp = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) {
      toast.error('OTP must be exactly 6 digits')
      return
    }
    if (newPass.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (newPass !== confirmPass) {
      toast.error('Passwords do not match')
      return
    }
    setOtpLoading(true)
    try {
      await api.post(
        '/super-auth/forgot-password/verify-otp',
        { email, otp, newPassword: newPass },
        { refreshOnUnauthorized: false }
      )
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
      <div className="bg-white rounded-3xl shadow-xl shadow-purple-950/5 p-8 sm:p-10 border border-purple-100 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-600">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display text-2xl font-bold text-[#120726] mb-2">Password Reset!</h3>
        <p className="text-sm text-purple-900/60 mb-6 font-medium">
          Your credentials have been securely updated. You may now sign in.
        </p>
        <button
          onClick={onBack}
          className="w-full font-bold py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg shadow-violet-500/25 transition-all hover:brightness-105"
        >
          Back to Sign In
        </button>
      </div>
    )
  }

  if (step === 'otp') {
    return (
      <div className="bg-white rounded-3xl shadow-xl shadow-purple-950/5 p-8 sm:p-10 border border-purple-100">
        <div className="mb-5">
          <h2 className="font-display text-2xl font-bold text-[#120726]">Enter Security Code</h2>
          <p className="text-sm text-purple-900/60 mt-1 font-medium">Code sent to {email}</p>
          <p className="text-xs mt-2 font-semibold" style={{ color: otpSecondsLeft > 0 ? '#7C3AED' : '#DC2626' }}>
            {otpSecondsLeft > 0
              ? `Code expires in ${Math.floor(otpSecondsLeft / 60)}:${String(otpSecondsLeft % 60).padStart(2, '0')}`
              : 'This code has expired. Request a new one.'}
          </p>
        </div>

        {devOtp && (
          <div className="mb-4 px-4 py-2.5 rounded-xl text-xs font-mono font-bold bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between">
            <span>Dev Mode OTP:</span>
            <span className="text-sm tracking-widest">{devOtp}</span>
          </div>
        )}

        <form onSubmit={submitOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-900/70 mb-1.5">
              6-Digit Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••••"
              maxLength={6}
              inputMode="numeric"
              autoFocus
              className="w-full border rounded-xl px-4 py-3 text-center text-2xl font-mono font-bold tracking-[0.5em] outline-none border-purple-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 bg-purple-50/20 text-[#120726]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-900/70 mb-1.5">
              New Password
            </label>
            <div className="flex items-center border rounded-xl overflow-hidden border-purple-200 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 bg-purple-50/20">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="••••••••"
                className="flex-1 px-3.5 py-2.5 text-sm outline-none bg-transparent text-[#120726]"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="px-3 text-purple-400 hover:text-purple-700"
              >
                <EyeIcon open={showNew} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-900/70 mb-1.5">
              Confirm Password
            </label>
            <div className="flex items-center border rounded-xl overflow-hidden border-purple-200 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 bg-purple-50/20">
              <input
                type={showConf ? 'text' : 'password'}
                value={confirmPass}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="flex-1 px-3.5 py-2.5 text-sm outline-none bg-transparent text-[#120726]"
              />
              <button
                type="button"
                onClick={() => setShowConf(!showConf)}
                className="px-3 text-purple-400 hover:text-purple-700"
              >
                <EyeIcon open={showConf} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={otpLoading}
            className="w-full font-bold py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg shadow-violet-500/25 transition-all disabled:opacity-60"
          >
            {otpLoading ? <span className="inline-flex items-center gap-2"><Spinner size="sm" className="border-white/30 border-t-white" /> Resetting…</span> : 'Confirm New Password'}
          </button>

          <button
            type="button"
            onClick={sendOtp}
            disabled={emailLoading || resendCooldown > 0}
            className="w-full text-xs font-semibold py-1.5 text-violet-600 hover:text-violet-800 disabled:opacity-50"
          >
            {emailLoading ? 'Sending…' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
          </button>
        </form>
      </div>
    )
  }

  // Email step
  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-purple-950/5 p-8 sm:p-10 border border-purple-100">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-[#120726]">Reset Credentials</h2>
        <p className="text-sm text-purple-900/60 mt-1 font-medium">
          Enter your super admin email to receive a verification OTP.
        </p>
      </div>

      <form onSubmit={submitEmail} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-purple-900/70 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@shmeta.com"
            autoFocus
            required
            className="w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none border-purple-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 bg-purple-50/20 text-[#120726]"
          />
        </div>

        <button
          type="submit"
          disabled={emailLoading}
          className="w-full font-bold py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg shadow-violet-500/25 transition-all disabled:opacity-60"
        >
          {emailLoading ? <span className="inline-flex items-center gap-2"><Spinner size="sm" className="border-white/30 border-t-white" /> Sending…</span> : 'Send Verification OTP'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-xs font-semibold py-2 text-violet-600 hover:text-violet-800 hover:underline"
        >
          ← Back to Sign In
        </button>
      </form>
    </div>
  )
}

function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}
