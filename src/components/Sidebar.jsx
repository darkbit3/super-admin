import { NavLink, useNavigate } from 'react-router-dom'
import { ROUTES } from '../config/routes'
import { authApi } from '../api/authApi'

const IconDashboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)
const IconManage = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)
const IconLogout = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

// Purple accent colour
const ACCENT  = '#7C3AED'
const ACCENT_BG = 'rgba(124,58,237,0.15)'
const ACCENT_BORDER = 'rgba(124,58,237,0.35)'
const DARK = '#1A0A2E'

const navItems = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: <IconDashboard /> },
  { label: 'Manage Admins', path: ROUTES.MANAGE, icon: <IconManage /> },
]

function SidebarContent({ onNavClick, onLogout }) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(124,58,237,0.2)' }}>
        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: ACCENT }}>
          <img src="/logo.png" alt="Shmeta" className="w-full h-full object-cover" onError={e => { e.target.style.display='none' }} />
        </div>
        <div>
          <h2 className="text-base font-bold leading-tight tracking-wide" style={{ color: '#F0EAF8', fontFamily: 'Georgia, serif' }}>Shmeta</h2>
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: ACCENT }}>Super Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavClick}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150"
            style={({ isActive }) => isActive
              ? { backgroundColor: ACCENT_BG, color: ACCENT, border: `1px solid ${ACCENT_BORDER}` }
              : { color: '#C4B5D4', border: '1px solid transparent' }
            }
          >
            {({ isActive }) => (
              <>
                <span style={{ color: isActive ? ACCENT : '#7A6A8A' }}>{item.icon}</span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(124,58,237,0.2)' }}>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150"
          style={{ color: '#C4B5D4' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#C4B5D4' }}
        >
          <IconLogout />
          Logout
        </button>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authApi.logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <>
      {/* Desktop sidebar — sticky, never scrolls with page */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0" style={{ backgroundColor: DARK, height: '100vh', position: 'sticky', top: 0 }}>
        <SidebarContent onNavClick={() => {}} onLogout={handleLogout} />
      </aside>

      {/* Mobile: top bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
        style={{ backgroundColor: DARK, borderBottom: '1px solid rgba(124,58,237,0.2)', height: '56px' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: ACCENT }}>
            <img src="/logo.png" alt="Shmeta" className="w-full h-full object-cover" onError={e => { e.target.style.display='none' }} />
          </div>
          <div>
            <span className="text-sm font-bold" style={{ color: '#F0EAF8', fontFamily: 'Georgia, serif' }}>Shmeta</span>
            <span className="ml-2 text-xs font-semibold" style={{ color: ACCENT }}>Super Admin</span>
          </div>
        </div>
        <button onClick={handleLogout} aria-label="Logout" className="flex items-center justify-center w-11 h-11 rounded-xl transition-colors" style={{ color: '#C4B5D4' }}>
          <IconLogout />
        </button>
      </div>

      {/* Mobile: bottom nav */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex"
        style={{ backgroundColor: DARK, borderTop: '1px solid rgba(124,58,237,0.2)', height: '64px', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-150"
            style={({ isActive }) => ({ color: isActive ? ACCENT : '#7A6A8A' })}
          >
            {({ isActive }) => (
              <>
                <span style={{ color: isActive ? ACCENT : '#7A6A8A' }}>{item.icon}</span>
                <span className="text-xs font-medium" style={{ color: isActive ? ACCENT : '#7A6A8A' }}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
