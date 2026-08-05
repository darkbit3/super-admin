import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

const ICONS = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const STYLES = {
  success: { bg: '#ECFDF5', border: '#6EE7B7', icon: '#059669', text: '#065F46' },
  error:   { bg: '#FEF2F2', border: '#FCA5A5', icon: '#DC2626', text: '#7F1D1D' },
  warning: { bg: '#FFFBEB', border: '#FCD34D', icon: '#D97706', text: '#78350F' },
  info:    { bg: '#EFF6FF', border: '#93C5FD', icon: '#2563EB', text: '#1E3A5F' },
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

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++_idCounter
    setToasts(prev => [...prev, { id, message, type }])
    if (duration > 0) {
      timersRef.current[id] = setTimeout(() => dismiss(id), duration)
    }
    return id
  }, [dismiss])

  const success = useCallback((msg, dur) => toast(msg, 'success', dur), [toast])
  const error   = useCallback((msg, dur) => toast(msg, 'error',   dur ?? 6000), [toast])
  const warning = useCallback((msg, dur) => toast(msg, 'warning', dur), [toast])
  const info    = useCallback((msg, dur) => toast(msg, 'info',    dur), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss }}>
      {children}
      <div
        aria-live="polite"
        className="fixed z-[9999] flex flex-col gap-2 pointer-events-none"
        style={{ top: '16px', right: '16px', left: '16px', maxWidth: '400px', marginLeft: 'auto' }}
      >
        {toasts.map(t => {
          const s = STYLES[t.type] || STYLES.info
          return (
            <div
              key={t.id}
              role="alert"
              className="flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg pointer-events-auto"
              style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, animation: 'slideIn 0.2s ease-out' }}
            >
              <span style={{ color: s.icon, marginTop: '1px' }}>{ICONS[t.type]}</span>
              <p className="flex-1 text-sm font-medium leading-snug" style={{ color: s.text }}>{t.message}</p>
              <button onClick={() => dismiss(t.id)} className="flex-shrink-0 ml-1 rounded p-0.5 hover:opacity-70 transition-opacity pointer-events-auto" style={{ color: s.icon }} aria-label="Dismiss">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
