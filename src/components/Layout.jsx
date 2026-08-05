import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F0EAF8' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto" style={{ paddingTop: 'var(--top-bar-h, 56px)' }}>
        <style>{`
          @media (min-width: 1024px) {
            main { padding-top: 0 !important; padding-bottom: 0 !important; }
          }
        `}</style>
        <div
          className="p-4 sm:p-6 max-w-screen-2xl mx-auto"
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
