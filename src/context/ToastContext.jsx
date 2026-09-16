import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

const ICONS = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const STYLES = {
  success: {
    bg: 'bg-white/95',
    border: 'border-emerald-300',
    iconBg: 'bg-emerald-50 text-emerald-600',
    text: 'text-slate-800',
    shadow: 'shadow-emerald-500/10'
  },
  error: {
    bg: 'bg-white/95',
    border: 'border-red-300',
    iconBg: 'bg-red-50 text-red-600',
    text: 'text-slate-800',
    shadow: 'shadow-red-500/10'
  },
  warning: {
    bg: 'bg-white/95',
    border: 'border-amber-300',
    iconBg: 'bg-amber-50 text-amber-600',
    text: 'text-slate-800',
    shadow: 'shadow-amber-500/10'
  },
  info: {
    bg: 'bg-white/95',
    border: 'border-violet-300',
    iconBg: 'bg-violet-50 text-violet-600',
    text: 'text-slate-800',
    shadow: 'shadow-violet-500/10'
  },
}

let _idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef({})

  const dismiss = useCallback((id) => {
    clearTimeout(timersRef.current[id])
    delete timersRef.current[id]
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++_idCounter
    setToasts(prev => [...prev, { id, message, type }])
    if (duration > 0) {
      timersRef.current[id] = setTimeout(() => dismiss(id), duration)
    }
    return id
  }, [dismiss])

  const success = useCallback((msg, dur) => toast(msg, 'success', dur), [toast])
  const error   = useCallback((msg, dur) => toast(msg, 'error',   dur ?? 3500), [toast])
  const warning = useCallback((msg, dur) => toast(msg, 'warning', dur ?? 3500), [toast])
  const info    = useCallback((msg, dur) => toast(msg, 'info',    dur ?? 3500), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss }}>
      {children}
      <div
        aria-live="polite"
        className="fixed z-[9999] flex flex-col gap-2.5 pointer-events-none"
        style={{ top: '20px', right: '20px', width: 'min(380px, calc(100vw - 32px))' }}
      >
        {toasts.map(t => {
          const s = STYLES[t.type] || STYLES.info
          return (
            <div
              key={t.id}
              role="alert"
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-md shadow-xl border pointer-events-auto transition-all ${s.bg} ${s.border} ${s.shadow}`}
              style={{ animation: 'toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
                {ICONS[t.type]}
              </div>
              <p className={`flex-1 text-xs font-semibold leading-relaxed ${s.text}`}>{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors pointer-events-auto"
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
