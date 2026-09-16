import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { manageApi } from '../api/manageApi'
import { useToast } from '../context/ToastContext'
import { ROUTES } from '../config/routes'

const cardDefs = [
  {
    key: 'total',
    label: 'Total Admins',
    subtext: 'Registered Platform Admins',
    color: 'from-violet-500/15 to-purple-500/5',
    borderColor: 'border-violet-200/60',
    iconColor: 'bg-violet-600 text-white',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-2 0" />
      </svg>
    ),
  },
  {
    key: 'active',
    label: 'Active Admins',
    subtext: 'Healthy Operating State',
    color: 'from-emerald-500/15 to-teal-500/5',
    borderColor: 'border-emerald-200/60',
    iconColor: 'bg-emerald-600 text-white',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'inactive',
    label: 'Blocked Admins',
    subtext: 'Restricted Privileges',
    color: 'from-rose-500/15 to-red-500/5',
    borderColor: 'border-rose-200/60',
    iconColor: 'bg-rose-600 text-white',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
  },
  {
    key: 'totalOwners',
    label: 'Total Owners',
    subtext: 'Mfrs & Resellers',
    color: 'from-blue-500/15 to-indigo-500/5',
    borderColor: 'border-blue-200/60',
    iconColor: 'bg-blue-600 text-white',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    key: 'totalCashiers',
    label: 'Total Cashiers',
    subtext: 'Point of Sale Operators',
    color: 'from-amber-500/15 to-yellow-500/5',
    borderColor: 'border-amber-200/60',
    iconColor: 'bg-amber-600 text-white',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    key: 'totalCutters',
    label: 'Total Cutters',
    subtext: 'Tailoring & Production',
    color: 'from-fuchsia-500/15 to-purple-500/5',
    borderColor: 'border-fuchsia-200/60',
    iconColor: 'bg-fuchsia-600 text-white',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 0A3 3 0 104.879 4.879a3 3 0 004.242 4.242zm0 5.656A3 3 0 104.879 19.121a3 3 0 004.242-4.242z" />
      </svg>
    ),
  },
]

const IconRefresh = ({ spinning }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

export default function Dashboard() {
  const toast = useToast()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStats = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await manageApi.getStats()
      setStats(data)
    } catch (err) {
      const msg = err.message || 'Failed to load dashboard metrics'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Layout>
      {/* Header section with Action Shortcuts */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#120726] tracking-tight">
              Network Command Overview
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
              Live
            </span>
          </div>
          <p className="text-sm text-purple-900/60 font-medium mt-0.5">
            Real-time counts of Admins, Business Owners, Cashiers, and Production Cutters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to={ROUTES.MANAGE}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-violet-700 bg-violet-100/70 hover:bg-violet-100 transition-colors border border-violet-200"
          >
            + Manage Admins
          </Link>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-purple-900 bg-white hover:bg-purple-50 transition-all border border-purple-200/80 shadow-xs disabled:opacity-50"
          >
            <IconRefresh spinning={loading} />
            <span>{loading ? 'Refreshing…' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchStats} className="underline text-xs font-bold">Try again</button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4 mb-8">
        {cardDefs.map((card) => (
          <div
            key={card.key}
            className={`card-hover relative bg-gradient-to-br ${card.color} bg-white rounded-2xl p-4 sm:p-5 border ${card.borderColor} shadow-sm overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-purple-950/70 tracking-tight truncate">{card.label}</span>
              <div className={`w-8 h-8 rounded-xl ${card.iconColor} flex items-center justify-center shadow-xs flex-shrink-0`}>
                {card.icon}
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-[#120726]">
                {loading ? (
                  <span className="inline-block w-12 h-7 rounded-lg bg-purple-200/50 animate-pulse" />
                ) : (
                  stats?.[card.key] ?? 0
                )}
              </p>
              <p className="text-[10px] text-purple-900/50 font-medium truncate mt-1">{card.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Mobile Account Summaries ────────────────────────────────────── */}
      <div className="lg:hidden space-y-4 mb-6">
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3.5 border-b border-purple-100 flex items-center justify-between bg-purple-50/30">
            <h2 className="text-sm font-bold text-[#120726]">Admin Accounts</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
              {stats?.adminsBreakdown?.length ?? 0} total
            </span>
          </div>
          <div className="divide-y divide-purple-50">
            {loading ? (
              <div className="p-4 text-xs text-purple-400 font-medium">Loading details…</div>
            ) : !stats?.adminsBreakdown?.length ? (
              <div className="p-4 text-xs text-purple-400 font-medium">No admin accounts registered yet.</div>
            ) : (
              stats.adminsBreakdown.map((admin) => (
                <div key={admin.id} className="p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {admin.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#120726] truncate">{admin.name}</p>
                    <p className="text-[11px] text-purple-900/60 mt-0.5">
                      {admin.owner_count} owners · {admin.cashier_count} cashiers · {admin.cutter_count} cutters
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      admin.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {admin.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3.5 border-b border-purple-100 flex items-center justify-between bg-purple-50/30">
            <h2 className="text-sm font-bold text-[#120726]">Owner Accounts</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {stats?.ownersBreakdown?.length ?? 0} total
            </span>
          </div>
          <div className="divide-y divide-purple-50">
            {loading ? (
              <div className="p-4 text-xs text-purple-400 font-medium">Loading details…</div>
            ) : !stats?.ownersBreakdown?.length ? (
              <div className="p-4 text-xs text-purple-400 font-medium">No owner accounts registered yet.</div>
            ) : (
              stats.ownersBreakdown.map((owner) => (
                <div key={owner.id} className="p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {owner.name?.charAt(0)?.toUpperCase() || 'O'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#120726] truncate">{owner.name}</p>
                    <p className="text-[11px] text-purple-900/60 mt-0.5">
                      {owner.role} · {owner.cashier_count} cashiers · {owner.cutter_count} cutters
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      owner.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {owner.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Desktop Admin Accounts Table ─────────────────────────────────── */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-purple-100/80 flex items-center justify-between bg-purple-50/20">
          <div>
            <h2 className="font-display font-bold text-base text-[#120726]">Admin Governance Matrix</h2>
            <p className="text-xs text-purple-900/50 font-medium mt-0.5">
              Breakdown of businesses, pos terminals, and cutters allocated to each Admin.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-100 text-violet-800 border border-violet-200">
            {stats?.adminsBreakdown?.length ?? 0} System Admins
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-purple-50/40 text-purple-900/70 font-bold text-[11px] uppercase tracking-wider border-b border-purple-100">
              <tr>
                <th className="px-6 py-3.5">Admin Profile</th>
                <th className="px-6 py-3.5">Phone Identifier</th>
                <th className="px-6 py-3.5 text-center">Business Owners</th>
                <th className="px-6 py-3.5 text-center">Manufacturers</th>
                <th className="px-6 py-3.5 text-center">Resellers</th>
                <th className="px-6 py-3.5 text-center">Active Cashiers</th>
                <th className="px-6 py-3.5 text-center">Cutters</th>
                <th className="px-6 py-3.5 text-right">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-purple-400 font-medium">
                    <span className="inline-block w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin mr-2 align-middle" />
                    Fetching admin accounts…
                  </td>
                </tr>
              ) : !stats?.adminsBreakdown || stats.adminsBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-purple-400 font-medium">
                    No administrator records found.
                  </td>
                </tr>
              ) : (
                stats.adminsBreakdown.map((admin) => (
                  <tr key={admin.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs shadow-xs">
                          {admin.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <span className="font-bold text-[#120726]">{admin.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-purple-900/70 font-mono text-xs">{admin.phone}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200">
                        {admin.owner_count} Owner{admin.owner_count !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {admin.manufacturer_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {admin.reseller_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {admin.cashier_count} Cashier{admin.cashier_count !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {admin.cutter_count} Cutter{admin.cutter_count !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          admin.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${admin.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{admin.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Desktop Owner Accounts Table ─────────────────────────────────── */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-purple-100/80 flex items-center justify-between bg-purple-50/20">
          <div>
            <h2 className="font-display font-bold text-base text-[#120726]">Business Owner Allocations</h2>
            <p className="text-xs text-purple-900/50 font-medium mt-0.5">
              Direct cashiers and cutters assigned to each business owner account.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            {stats?.ownersBreakdown?.length ?? 0} Business Owners
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-purple-50/40 text-purple-900/70 font-bold text-[11px] uppercase tracking-wider border-b border-purple-100">
              <tr>
                <th className="px-6 py-3.5">Owner Profile</th>
                <th className="px-6 py-3.5">Phone Identifier</th>
                <th className="px-6 py-3.5">Business Role</th>
                <th className="px-6 py-3.5 text-center">Assigned Cashiers</th>
                <th className="px-6 py-3.5 text-center">Assigned Cutters</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-purple-400 font-medium">
                    <span className="inline-block w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin mr-2 align-middle" />
                    Fetching business owners…
                  </td>
                </tr>
              ) : !stats?.ownersBreakdown || stats.ownersBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-purple-400 font-medium">
                    No business owner records found.
                  </td>
                </tr>
              ) : (
                stats.ownersBreakdown.map((owner) => (
                  <tr key={owner.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#120726]">{owner.name}</td>
                    <td className="px-6 py-4 text-purple-900/70 font-mono text-xs">{owner.phone}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          owner.role === 'Manufacturer'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {owner.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {owner.cashier_count} Cashier(s)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {owner.cutter_count} Cutter(s)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          owner.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${owner.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{owner.status}</span>
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
