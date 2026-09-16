import { NavLink, useNavigate } from 'react-router-dom'
import { ROUTES } from '../config/routes'
import { authApi } from '../api/authApi'

const IconDashboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
  </svg>
)
const IconManage = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)
const IconChat = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)
const IconHistory = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
const IconRegisterFee = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
  </svg>
)
const IconLogout = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const navItems = [
  { label: 'Dashboard',     path: ROUTES.DASHBOARD,    icon: <IconDashboard /> },
  { label: 'Manage Admins', path: ROUTES.MANAGE,       icon: <IconManage /> },
  { label: 'Register Fee',  path: ROUTES.REGISTER_FEE, icon: <IconRegisterFee /> },
  { label: 'Chat',          path: ROUTES.CHAT,          icon: <IconChat /> },
  { label: 'History',       path: ROUTES.HISTORY,       icon: <IconHistory /> },
]

function SidebarContent({ onNavClick, onLogout }) {
  return (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-purple-500/15">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-md shadow-purple-950/20 flex items-center justify-center p-1.5 overflow-hidden flex-shrink-0 border border-purple-200/40">
            <img src="/logo.png" alt="Shmeta Logo" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-white tracking-tight">Shmeta</span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-purple-300/60 uppercase tracking-wider">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <p className="px-3 pb-1 text-[11px] font-semibold text-purple-300/40 uppercase tracking-wider">Navigation</p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavClick}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600/30 to-purple-600/15 text-white font-semibold shadow-inner border border-violet-500/30'
                  : 'text-purple-200/70 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active left indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-violet-400 to-purple-500 rounded-r-full shadow-sm shadow-violet-400/50" />
                )}
                <span className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-violet-300' : 'text-purple-300/60 group-hover:text-purple-200'}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Status Card & Logout */}
      <div className="p-3 border-t border-purple-500/15 space-y-2">
        <div className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                SA
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#120726]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">Super Admin</p>
              <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span>System Active</span>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-medium text-purple-300/70 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-150"
        >
          <IconLogout />
          <span>Sign Out</span>
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
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 flex-shrink-0 z-40"
        style={{
          backgroundColor: '#120726',
          height: '100vh',
          position: 'sticky',
          top: 0,
          borderRight: '1px solid rgba(167, 139, 250, 0.15)',
        }}
      >
        <SidebarContent onNavClick={() => {}} onLogout={handleLogout} />
      </aside>

      {/* Mobile: Top Bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
        style={{
          backgroundColor: 'rgba(18, 7, 38, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(167, 139, 250, 0.18)',
          height: '56px',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center p-1 overflow-hidden flex-shrink-0 border border-purple-200/40">
            <img src="/logo.png" alt="Shmeta Logo" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <span className="font-display font-bold text-sm text-white">Shmeta</span>
            <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-400/30">
              Admin
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.06] text-purple-300 hover:text-rose-400 transition-colors"
        >
          <IconLogout />
        </button>
      </div>

      {/* Mobile: Bottom Nav Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2"
        style={{
          backgroundColor: 'rgba(18, 7, 38, 0.95)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(167, 139, 250, 0.18)',
          height: '64px',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg transition-all ${
                isActive ? 'text-violet-400 font-semibold' : 'text-purple-300/50 hover:text-purple-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`transition-transform duration-150 ${isActive ? 'scale-110 text-violet-400' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
