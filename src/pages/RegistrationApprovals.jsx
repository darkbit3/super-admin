import { useEffect, useState, useCallback } from 'react'
import Layout from '../components/Layout'
import { manageApi } from '../api/manageApi'
import { useToast } from '../context/ToastContext'
import { Spinner } from '../components/Loaders'

const STATUS_COLORS = {
  pending:  'bg-amber-50  text-amber-700  border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50    text-red-700    border-red-200',
}
const STATUS_DOTS = {
  pending:  'bg-amber-400',
  approved: 'bg-emerald-500',
  rejected: 'bg-red-500',
}

function StatusPill({ status }) {
  const s = (status || '').toLowerCase()
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase border ${STATUS_COLORS[s] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOTS[s] || 'bg-slate-400'}`} />
      {status}
    </span>
  )
}

function RejectModal({ onConfirm, onCancel, loading }) {
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Reject Registration</h3>
        <p className="text-xs text-slate-500 mb-4">This will notify the user immediately via the app.</p>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Rejection Reason (optional)</label>
        <textarea
          id="reject-reason-input"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Payment screenshot unclear, please resubmit."
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 text-slate-800 resize-none"
        />
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
            Cancel
          </button>
          <button id="confirm-reject-btn" type="button" onClick={() => onConfirm(reason)} disabled={loading}
            className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-md transition-all disabled:opacity-60">
            {loading ? 'Rejecting…' : 'Confirm Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RegistrationApprovals() {
  const toast = useToast()

  const [requests, setRequests]       = useState([])
  const [stats, setStats]             = useState({})
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [filterStatus, setFilterStatus] = useState('pending')
  const [actionLoading, setActionLoading] = useState(null) // request id
  const [rejectTarget, setRejectTarget]   = useState(null) // { id }

  const fetchAll = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [listRes, statsRes] = await Promise.all([
        manageApi.getRegistrationRequests(filterStatus || undefined),
        manageApi.getRegistrationStats(),
      ])
      setRequests(listRes?.data || [])
      setStats(statsRes?.data || {})
    } catch (err) {
      const msg = err.message || 'Failed to load registration requests'
      setError(msg); toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleApprove = async (id) => {
    setActionLoading(id)
    try {
      await manageApi.approveRegistration(id)
      toast.success('Registration approved! User has been notified.')
      fetchAll()
    } catch (err) {
      toast.error(err.message || 'Failed to approve registration')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectConfirm = async (reason) => {
    if (!rejectTarget) return
    setActionLoading(rejectTarget.id)
    try {
      await manageApi.rejectRegistration(rejectTarget.id, reason)
      toast.success('Registration rejected. User has been notified.')
      setRejectTarget(null)
      fetchAll()
    } catch (err) {
      toast.error(err.message || 'Failed to reject registration')
    } finally {
      setActionLoading(null)
    }
  }

  const FILTERS = [
    { label: 'Pending',  value: 'pending',  emoji: '⏳' },
    { label: 'Approved', value: 'approved', emoji: '✅' },
    { label: 'Rejected', value: 'rejected', emoji: '❌' },
    { label: 'All',      value: '',         emoji: '📋' },
  ]

  return (
    <Layout>
      {rejectTarget && (
        <RejectModal
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
          loading={actionLoading === rejectTarget.id}
        />
      )}

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
              Registration Approvals
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Review, approve, or reject paid-plan registration requests submitted by merchants.
          </p>
        </div>
        <button type="button" onClick={fetchAll} disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-amber-200/80 bg-white/80 hover:bg-white text-slate-700 shadow-sm transition-all active:scale-95 disabled:opacity-50">
          {loading ? <Spinner size="sm" /> : '↺'} Refresh
        </button>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pending',  value: stats.pending  ?? '—', color: 'bg-amber-50  text-amber-700',   icon: '⏳' },
          { label: 'Approved', value: stats.approved ?? '—', color: 'bg-emerald-50 text-emerald-700', icon: '✅' },
          { label: 'Rejected', value: stats.rejected ?? '—', color: 'bg-red-50    text-red-700',    icon: '❌' },
          { label: 'Total',    value: stats.total    ?? '—', color: 'bg-violet-50 text-violet-700',  icon: '📋' },
        ].map(s => (
          <div key={s.label} className="bg-white/80 backdrop-blur rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{s.label}</p>
              <p className="text-xl font-extrabold text-slate-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Tabs ───────────────────────────────────────────────────── */}
      <div className="mb-5 flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button id={`filter-${f.value || 'all'}`} key={f.value} type="button"
            onClick={() => setFilterStatus(f.value)}
            className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all ${
              filterStatus === f.value
                ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
            }`}>
            {f.emoji} {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold">✕</button>
        </div>
      )}

      {/* ── Requests List ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center gap-3 py-16 justify-center text-slate-400 text-sm">
          <Spinner /> Loading registration requests…
        </div>
      ) : requests.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-slate-600 font-semibold">No {filterStatus || ''} requests found</p>
          <p className="text-slate-400 text-sm mt-1">Check back later or change the filter above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                {/* Left — User info */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0">
                    {(req.name || '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-base truncate">{req.name}</span>
                      <StatusPill status={req.status} />
                    </div>
                    <div className="text-xs text-slate-500 space-y-0.5">
                      <p>📞 {req.phone}</p>
                      <p>🏷️ <span className="font-medium text-slate-700">{req.plan_label || req.plan_key}</span> — <span className="text-violet-700 font-bold">ETB {req.fee}</span></p>
                      <p>👤 {req.role}</p>
                      {req.rejection_reason && (
                        <p className="text-red-600">❗ Reason: {req.rejection_reason}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right — Date + Actions */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {req.created_at ? new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </span>
                  {(req.status || '').toLowerCase() === 'pending' && (
                    <div className="flex gap-2">
                      <button id={`approve-btn-${req.id}`} type="button"
                        disabled={actionLoading === req.id}
                        onClick={() => handleApprove(req.id)}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50">
                        {actionLoading === req.id ? <Spinner size="sm" className="border-white/30 border-t-white" /> : '✓'} Approve
                      </button>
                      <button id={`reject-btn-${req.id}`} type="button"
                        disabled={actionLoading === req.id}
                        onClick={() => setRejectTarget({ id: req.id })}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50">
                        ✕ Reject
                      </button>
                    </div>
                  )}
                  {(req.status || '').toLowerCase() === 'approved' && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      ✅ Approved
                      {req.reviewed_at && <span className="text-slate-400 font-normal">· {new Date(req.reviewed_at).toLocaleDateString()}</span>}
                    </span>
                  )}
                  {(req.status || '').toLowerCase() === 'rejected' && (
                    <span className="text-xs font-semibold text-red-500 flex items-center gap-1">
                      ❌ Rejected
                      {req.reviewed_at && <span className="text-slate-400 font-normal">· {new Date(req.reviewed_at).toLocaleDateString()}</span>}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
