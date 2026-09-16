import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F0EAF8' }}>
      <Sidebar />
      {/* Only main scrolls — sidebar stays fixed */}
      <main className="flex-1 overflow-y-auto flex flex-col" style={{ paddingTop: 'var(--top-bar-h, 56px)' }}>
        <style>{`
          @media (min-width: 1024px) {
            main { padding-top: 0 !important; }
          }
        `}</style>

        {/* Desktop top header bar */}
        <header
          className="hidden lg:flex items-center justify-between px-6 py-3 sticky top-0 z-30 flex-shrink-0"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #DDD0F0',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-purple-200/50 flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
              <img src="/logo.png" alt="Shmeta Super Admin" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-wide" style={{ color: '#1A0A2E', fontFamily: 'Georgia, serif' }}>
                  Shmeta
                </span>
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(124,58,237,0.1)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.2)' }}
                >
                  Super Admin
                </span>
              </div>
              <p className="text-xs" style={{ color: '#7A6A8A' }}>Global System Administration</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-purple-100 shadow-xs text-xs font-medium" style={{ color: '#3A2A4A' }}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Super Admin Active
            </div>
          </div>
        </header>

        <div
          className="flex-1 p-4 sm:p-6 max-w-screen-2xl mx-auto w-full"
          style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom) + 16px)' }}
        >
          <style>{`
            @media (min-width: 1024px) {
              .layout-inner { padding-bottom: 1.5rem !important; }
            }
          `}</style>
          <div className="layout-inner">{children}</div>
        </div>
      </main>
    </div>
  )
}
