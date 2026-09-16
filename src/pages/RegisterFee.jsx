import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { manageApi } from '../api/manageApi'
import { useToast } from '../context/ToastContext'
import { Spinner } from '../components/Loaders'

const PLAN_DEFS = [
  { key: 'oneMonth', label: '1 Month Plan', sub: 'Standard single month access with full portal features', months: 1 },
  { key: 'twoMonths', label: '2 Months Plan', sub: 'Extended introductory tier for growing stores', months: 2 },
  { key: 'threeMonths', label: '3 Months Plan', sub: 'Quarterly subscription option with standard support', months: 3 },
  { key: 'sixMonths', label: '6 Months Plan', sub: 'Semi-annual package with preferred merchant perks', months: 6 },
  { key: 'oneYear', label: '1 Year Plan', sub: 'Annual enterprise subscription tier with max discount', months: 12 },
]

const emptyPlans = Object.fromEntries(PLAN_DEFS.map(p => [p.key, { fee: '', enabled: true }]))

export default function RegisterFee() {
  const toast = useToast()
  const [plans, setPlans]     = useState(emptyPlans)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const fetchFee = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await manageApi.getRegisterFee()
      setPlans(Object.fromEntries(PLAN_DEFS.map(p => [p.key, {
        fee: String(response?.[p.key]?.fee ?? 0),
        enabled: response?.[p.key]?.enabled !== false,
      }])))
    } catch (err) {
      const message = err.message || 'Failed to load registration fee schedule'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFee()
  }, [])

  const handleSave = async () => {
    const values = Object.fromEntries(Object.entries(plans).map(([key, value]) => [key, {
      fee: Number(value.fee),
      enabled: value.enabled,
    }]))

    if (Object.values(values).some(value => !Number.isFinite(value.fee) || value.fee < 0)) {
      setError('Each registration fee must be a valid, non-negative number')
      return
    }

    setSaving(true)
    setError('')
    try {
      const response = await manageApi.updateRegisterFee(values)
      setPlans(Object.fromEntries(PLAN_DEFS.map(p => [p.key, {
        fee: String(response?.data?.[p.key]?.fee ?? values[p.key].fee),
        enabled: response?.data?.[p.key]?.enabled ?? values[p.key].enabled,
      }])))
      toast.success('Registration fee settings saved successfully')
    } catch (err) {
      const message = err.message || 'Unable to update registration fees'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const enabledCount = Object.values(plans).filter(p => p.enabled).length

  return (
    <Layout>
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-violet-100 text-violet-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
              Registration Fees
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage onboarding pricing, trial duration fees, and availability across merchant registration plans.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchFee}
            disabled={loading || saving}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-purple-200/80 bg-white/80 hover:bg-white text-slate-700 shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Spinner size="sm" /> : <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>}
            <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading || saving}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-md shadow-violet-600/20 transition-all hover:shadow-lg active:scale-95 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
          >
            {saving ? (
              <>
                <Spinner size="sm" className="border-white/30 border-t-white" />
                <span>Saving Changes…</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Save All Plans</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Status Banner ─────────────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-sm">
            ETB
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Billing Currency</p>
            <p className="text-sm font-bold text-slate-800">Ethiopian Birr (ETB)</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
            {enabledCount}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Active Tiers</p>
            <p className="text-sm font-bold text-slate-800">{enabledCount} of {PLAN_DEFS.length} Plans Enabled</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Sync Status</p>
            <p className="text-sm font-bold text-slate-800">{loading ? 'Synchronizing…' : 'Up to date'}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-medium flex items-center justify-between shadow-sm">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>
      )}

      {/* ── Plans Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {PLAN_DEFS.map((plan) => {
          const current = plans[plan.key] || { fee: '0', enabled: true }
          const isEnabled = current.enabled
          const monthlyFee = isEnabled && Number(current.fee) > 0 ? (Number(current.fee) / plan.months).toFixed(1) : null

          return (
            <div
              key={plan.key}
              className={`bg-white rounded-2xl border transition-all duration-200 p-5 shadow-sm flex flex-col justify-between ${
                isEnabled
                  ? 'border-purple-200/90 hover:border-violet-300 hover:shadow-md'
                  : 'border-slate-200/80 bg-slate-50/40 opacity-75'
              }`}
            >
              <div>
                {/* Card Top: Plan Name & Toggle Switch */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 font-heading">
                        {plan.label}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {plan.sub}
                    </p>
                  </div>

                  {/* Modern Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => setPlans(cur => ({
                        ...cur,
                        [plan.key]: { ...cur[plan.key], enabled: e.target.checked }
                      }))}
                      disabled={loading || saving}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                  </label>
                </div>

                {/* Input Field */}
                <div className="mt-4">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Registration Fee Amount
                  </label>
                  <div className={`flex items-center border rounded-xl overflow-hidden transition-all bg-white ${
                    isEnabled
                      ? 'border-slate-200 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100'
                      : 'border-slate-200 bg-slate-50'
                  }`}>
                    <span className="px-3.5 py-3 bg-purple-50/70 text-violet-700 text-xs font-bold border-r border-slate-200 select-none flex items-center gap-1">
                      ETB
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={current.fee}
                      onChange={(e) => setPlans(cur => ({
                        ...cur,
                        [plan.key]: { ...cur[plan.key], fee: e.target.value }
                      }))}
                      disabled={!isEnabled || loading || saving}
                      placeholder="0.00"
                      className="w-full px-3.5 py-3 text-sm font-semibold outline-none bg-transparent text-slate-800 disabled:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer: Monthly Breakdown */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Duration: {plan.months} {plan.months === 1 ? 'Month' : 'Months'}</span>
                {monthlyFee && (
                  <span className="font-medium text-violet-700">
                    ≈ {monthlyFee} ETB / month
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Bottom Save Action Bar ────────────────────────────────────────── */}
      <div className="mt-8 bg-white/90 backdrop-blur-md rounded-2xl border border-purple-100 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Notice:</span> Modifications apply immediately to new merchant self-registrations and admin onboarding checkouts.
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || saving}
          className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white rounded-xl shadow-md shadow-violet-600/20 transition-all hover:shadow-lg active:scale-95 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
        >
          {saving ? 'Saving Changes…' : 'Save Registration Fee Settings'}
        </button>
      </div>
    </Layout>
  )
}
