import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { manageApi } from '../api/manageApi'
import { useToast } from '../context/ToastContext'

const ACCENT = '#7C3AED'

const cardDefs = [
  {
    key: 'total',
    label: 'Total Admins',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-2 0" />
      </svg>
    ),
  },
  {
    key: 'active',
    label: 'Active Admins',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'inactive',
    label: 'Blocked Admins',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'totalOwners',
    label: 'Total Owners',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    key: 'totalCashiers',
    label: 'Total Cashiers',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    key: 'totalCutters',
    label: 'Total Cutters',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 0A3 3 0 104.879 4.879a3 3 0 004.242 4.242zm0 5.656A3 3 0 104.879 19.121a3 3 0 004.242-4.242z" />
      </svg>
    ),
  },
]

const IconRefresh = ({ spinning }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

export default function Dashboard() {
  const toast = useToast()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const fetchStats = async () => {
    setLoading(true); setError('')
    try {
      const data = await manageApi.getStats()
      setStats(data)
    } catch (err) {
      const msg = err.message || 'Failed to load stats'
      setError(msg); toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Layout>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#1A0A2E', fontFamily: 'Georgia, serif' }}>Super Admin Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: '#7A6A8A' }}>Overview of Admins, Owners, Cashiers, and Cutters</p>
        </div>
        <button
          onClick={fetchStats} disabled={loading} aria-label="Refresh" title="Refresh"
          className="flex items-center justify-center gap-2 rounded-xl border transition-all disabled:opacity-50 w-11 h-11 sm:w-auto sm:h-auto sm:px-4 sm:py-2"
          style={{ backgroundColor: 'white', color: '#3A2A4A', borderColor: '#DDD0F0' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F0EAF8'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
        >
          <IconRefresh spinning={loading} />
          <span className="hidden sm:inline text-sm font-medium">{loading ? 'Loading…' : 'Refresh'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {cardDefs.map((card) => (
          <div
            key={card.key}
            className="bg-white rounded-xl p-4 flex flex-col gap-2"
            style={{ border: '1px solid #DDD0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(124,58,237,0.12)', color: ACCENT }}>
              {card.icon}
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: '#7A6A8A' }}>{card.label}</p>
              <p className="text-2xl font-bold mt-0.5" style={{ color: '#1A0A2E' }}>
                {loading ? (
                  <span className="inline-block w-10 h-6 rounded animate-pulse align-middle" style={{ backgroundColor: '#DDD0F0' }} />
                ) : (
                  stats?.[card.key] ?? 0
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Admin Accounts Table ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-[#DDD0F0] overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-[#DDD0F0] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1A0A2E]">Admin Account Details</h2>
            <p className="text-xs text-[#7A6A8A]">Owners, cashiers &amp; cutters managed by each Admin</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
            {stats?.adminsBreakdown?.length ?? 0} Admins
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F0EAF8] text-[#3A2A4A] font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Admin Name</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3 text-center">Owners</th>
                <th className="px-5 py-3 text-center">Manufacturers</th>
                <th className="px-5 py-3 text-center">Resellers</th>
                <th className="px-5 py-3 text-center">Cashiers</th>
                <th className="px-5 py-3 text-center">Cutters</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading admin details…</td></tr>
              ) : !stats?.adminsBreakdown || stats.adminsBreakdown.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No admin accounts created yet</td></tr>
              ) : (
                stats.adminsBreakdown.map((admin) => (
                  <tr key={admin.id} className="hover:bg-purple-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{admin.name}</td>
                    <td className="px-5 py-3.5 text-gray-600 font-mono text-xs">{admin.phone}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200">
                        {admin.owner_count} Owner{admin.owner_count !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {admin.manufacturer_count}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {admin.reseller_count}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {admin.cashier_count} Cashier{admin.cashier_count !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {admin.cutter_count} Cutter{admin.cutter_count !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        admin.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {admin.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Owners Breakdown Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#DDD0F0] overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-[#DDD0F0] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1A0A2E]">Owner Account Details</h2>
            <p className="text-xs text-[#7A6A8A]">Total cashiers &amp; cutters assigned to each Manufacturer / Reseller owner</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
            {stats?.ownersBreakdown?.length ?? 0} Owners
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F0EAF8] text-[#3A2A4A] font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Owner Name</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3 text-center">Cashiers</th>
                <th className="px-5 py-3 text-center">Cutters</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading details…</td></tr>
              ) : !stats?.ownersBreakdown || stats.ownersBreakdown.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No owner accounts created yet</td></tr>
              ) : (
                stats.ownersBreakdown.map((owner) => (
                  <tr key={owner.id} className="hover:bg-purple-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{owner.name}</td>
                    <td className="px-5 py-3.5 text-gray-600 font-mono text-xs">{owner.phone}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        owner.role === 'Manufacturer' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {owner.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {owner.cashier_count} Cashier(s)
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {owner.cutter_count} Cutter(s)
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        owner.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {owner.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
