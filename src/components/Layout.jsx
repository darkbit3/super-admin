import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F6F2FB] relative">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-1/3 w-80 h-80 bg-violet-200/20 rounded-full blur-3xl" />

      {/* Persistent Sidebar */}
      <Sidebar />

      {/* Main Scrollable Canvas */}
      <main className="flex-1 overflow-y-auto flex flex-col relative z-10" style={{ paddingTop: 'var(--top-bar-h, 56px)' }}>
        <style>{`
          @media (min-width: 1024px) {
            main { padding-top: 0 !important; }
          }
        `}</style>

        {/* Desktop Top Header Bar */}
        <header
          className="hidden lg:flex items-center justify-between px-8 py-3.5 sticky top-0 z-30 flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-purple-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white shadow-sm border border-purple-200/50 flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
              <img src="/logo.png" alt="Shmeta Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-[#120726] tracking-tight">Shmeta</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                  Super Admin Console
                </span>
              </div>
              <p className="text-xs text-purple-900/50 font-medium">Global Network Administration</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 shadow-xs text-xs font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Production Live</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full"
          style={{ paddingBottom: 'calc(72px + env(safe-area-inset-bottom) + 16px)' }}
        >
          <style>{`
            @media (min-width: 1024px) {
              .layout-inner { padding-bottom: 2rem !important; }
            }
          `}</style>
          <div className="layout-inner">{children}</div>
        </div>
      </main>
    </div>
  )
}
