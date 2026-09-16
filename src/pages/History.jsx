import { useState, useMemo } from 'react'
import Layout from '../components/Layout'

const MOCK_EVENTS = [
  {
    id: 'evt-101',
    actor: 'Super Admin',
    role: 'Root',
    action: 'Registration Fee Schedule Updated',
    category: 'Settings',
    target: 'Registration Tiers (oneMonth: 150 ETB, oneYear: 1,200 ETB)',
    status: 'Success',
    ip: '197.156.103.42',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: 'evt-102',
    actor: 'Abebe Kebede',
    role: 'Admin',
    action: 'Administrator Account Created',
    category: 'Admin Management',
    target: 'Dawit Mengistu (0911445566)',
    status: 'Success',
    ip: '197.156.105.18',
    timestamp: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
  },
  {
    id: 'evt-103',
    actor: 'Dawit Mengistu',
    role: 'Admin',
    action: 'Portal Password Reset Requested',
    category: 'Security',
    target: 'Account: 0911445566',
    status: 'Success',
    ip: '213.55.102.14',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: 'evt-104',
    actor: 'Super Admin',
    role: 'Root',
    action: 'Admin Account Suspended',
    category: 'Admin Management',
    target: 'Solomon Haile (0922334455) set to Inactive',
    status: 'Warning',
    ip: '197.156.103.42',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'evt-105',
    actor: 'Helen Tadesse',
    role: 'Admin',
    action: 'Admin Portal Login',
    category: 'Security',
    target: 'Direct authentication session',
    status: 'Success',
    ip: '196.188.241.9',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
  },
  {
    id: 'evt-106',
    actor: 'Unknown IP',
    role: 'Guest',
    action: 'Failed Super Admin Authentication',
    category: 'Security',
    target: 'Invalid credentials attempted 3 times',
    status: 'Danger',
    ip: '45.142.214.88',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: 'evt-107',
    actor: 'Super Admin',
    role: 'Root',
    action: 'Team Chat Group Created',
    category: 'Collaboration',
    target: 'Group: "HQ Management" with 4 members',
    status: 'Success',
    ip: '197.156.103.42',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 38).toISOString(),
  },
]

function formatEventTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

function StatusPill({ status }) {
  const styles = {
    Success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    Warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    Danger:  'bg-red-50 text-red-700 border-red-200/80',
  }
  const cls = styles[status] || 'bg-slate-100 text-slate-700 border-slate-200'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Success' ? 'bg-emerald-500' : status === 'Warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
      {status}
    </span>
  )
}

export default function History() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const categories = ['All', 'Security', 'Admin Management', 'Settings', 'Collaboration']

  const filteredEvents = useMemo(() => {
    return MOCK_EVENTS.filter(evt => {
      const matchesCat = filter === 'All' || evt.category === filter
      const matchesSearch = !search ||
        evt.action.toLowerCase().includes(search.toLowerCase()) ||
        evt.actor.toLowerCase().includes(search.toLowerCase()) ||
        evt.target.toLowerCase().includes(search.toLowerCase()) ||
        evt.ip.includes(search)
      return matchesCat && matchesSearch
    })
  }, [filter, search])

  return (
    <Layout>
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-violet-100 text-violet-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
              Audit Trail & History
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Tamper-evident activity logs, administrative modifications, and security events.
          </p>
        </div>

        <button
          onClick={() => alert('Audit log export compiled as CSV.')}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-purple-200/80 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-all active:scale-95 self-start sm:self-auto"
        >
          <svg className="w-3.5 h-3.5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Export Logs</span>
        </button>
      </div>

      {/* ── Filter Bar ────────────────────────────────────────────────────── */}
      <div className="mb-4 bg-white rounded-2xl border border-purple-100 p-3 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by action, actor, or IP…"
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-purple-100 bg-slate-50/70 focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none text-slate-800 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-2.5 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  filter === cat
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Timeline Events List ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden divide-y divide-purple-50">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm font-semibold text-slate-700">No activity logs found</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting another category.</p>
          </div>
        ) : (
          filteredEvents.map(evt => (
            <div key={evt.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5 border border-purple-100">
                  {evt.role[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{evt.action}</span>
                    <StatusPill status={evt.status} />
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">{evt.target}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                    <span>By <strong className="text-slate-700">{evt.actor}</strong> ({evt.role})</span>
                    <span>•</span>
                    <span className="font-mono">IP: {evt.ip}</span>
                  </div>
                </div>
              </div>

              <div className="sm:text-right flex-shrink-0 self-start sm:self-center">
                <p className="text-xs font-semibold text-slate-700">{formatEventTime(evt.timestamp)}</p>
                <span className="text-[10px] uppercase font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                  {evt.category}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  )
}
