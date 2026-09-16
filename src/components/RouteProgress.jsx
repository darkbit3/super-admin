import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export default function RouteProgress() {
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [exiting, setExiting] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Avoid jarring overlay on initial cold boot, but show on any route change
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    setLoading(true)
    setExiting(false)

    // Keep visible for ~420ms so user sees the smooth transition effect
    const holdTimer = setTimeout(() => {
      setExiting(true)
      const hideTimer = setTimeout(() => {
        setLoading(false)
        setExiting(false)
      }, 220) // Smooth fade out duration
      return () => clearTimeout(hideTimer)
    }, 420)

    return () => {
      clearTimeout(holdTimer)
    }
  }, [location.pathname, location.search])

  if (!loading) return null

  return (
    <div
      className={`route-loader-overlay ${exiting ? 'route-loader-fadeout' : 'route-loader-fadein'}`}
      role="status"
      aria-label="Loading page"
    >
      {/* Top running gradient bar */}
      <div className="route-progress-bar" />

      {/* Centered Glassmorphic Loading Card */}
      <div className="route-loader-card">
        {/* Animated outer glowing ring with brand logo */}
        <div className="relative flex items-center justify-center mb-3">
          <div className="route-loader-ring" />
          
          {/* Logo container */}
          <div className="w-14 h-14 rounded-2xl bg-white shadow-xl shadow-purple-900/10 border border-purple-200/80 flex items-center justify-center p-2 z-10 overflow-hidden">
            <img
              src="/logo.png"
              alt="Shmeta Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Brand and loading text */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="font-display font-bold text-sm text-[#120726] tracking-tight">Shmeta</span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 border border-violet-200 font-sans">
              Super Admin
            </span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-purple-700/80">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-ping" />
            <span>Switching page...</span>
          </div>
        </div>
      </div>
    </div>
  )
}
