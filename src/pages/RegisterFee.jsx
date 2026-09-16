import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { manageApi } from '../api/manageApi'
import { useToast } from '../context/ToastContext'
import { Spinner } from '../components/Loaders'

const PLAN_DEFS = [
  { key: 'oneMonth',    label: '1 Month Plan',  sub: 'Standard single month access with full portal features',           months: 1  },
  { key: 'twoMonths',  label: '2 Months Plan',  sub: 'Extended introductory tier for growing stores',                    months: 2  },
  { key: 'threeMonths',label: '3 Months Plan',  sub: 'Quarterly subscription option with standard support',             months: 3  },
  { key: 'sixMonths',  label: '6 Months Plan',  sub: 'Semi-annual package with preferred merchant perks',               months: 6  },
  { key: 'oneYear',    label: '1 Year Plan',    sub: 'Annual enterprise subscription tier with max discount',            months: 12 },
]

const BANK_OPTIONS = [
  'Commercial Bank of Ethiopia (CBE)',
  'Telebirr',
  'Abyssinia Bank',
  'Awash Bank',
  'Bank of Abyssinia (BOA)',
  'Dashen Bank',
  'Nib Bank',
  'United Bank',
  'Other',
]

const emptyPlans = Object.fromEntries(PLAN_DEFS.map(p => [p.key, { fee: '', enabled: true }]))

export default function RegisterFee() {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('plans')

  // ── Plan Pricing State ─────────────────────────────────────────────────────
  const [plans, setPlans]     = useState(emptyPlans)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  // ── Account Details State ──────────────────────────────────────────────────
  const [telegramUsername, setTelegramUsername] = useState('')
  const [accounts, setAccounts] = useState([])
  const [payLoading, setPayLoading] = useState(false)
  const [paySaving, setPaySaving]   = useState(false)
  const [payError, setPayError]     = useState('')

  // ── Fetch Data ─────────────────────────────────────────────────────────────
  const fetchFee = async () => {
    setLoading(true); setError('')
    try {
      const response = await manageApi.getRegisterFee()
      setPlans(Object.fromEntries(PLAN_DEFS.map(p => [p.key, {
        fee: String(response?.[p.key]?.fee ?? 0),
        enabled: response?.[p.key]?.enabled !== false,
      }])))
    } catch (err) {
      const msg = err.message || 'Failed to load registration fee schedule'
      setError(msg); toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentInfo = async () => {
    setPayLoading(true); setPayError('')
    try {
      const res = await manageApi.getPaymentInfo()
      setTelegramUsername(res?.data?.telegramUsername || '')
      setAccounts(res?.data?.accounts || [])
    } catch (err) {
      const msg = err.message || 'Failed to load payment info'
      setPayError(msg)
    } finally {
      setPayLoading(false)
    }
  }

  useEffect(() => { fetchFee(); fetchPaymentInfo() }, [])

  // ── Save Plans ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const values = Object.fromEntries(Object.entries(plans).map(([key, v]) => [key, { fee: Number(v.fee), enabled: v.enabled }]))
    if (Object.values(values).some(v => !Number.isFinite(v.fee) || v.fee < 0)) {
      setError('Each registration fee must be a valid, non-negative number'); return
    }
    setSaving(true); setError('')
    try {
      const res = await manageApi.updateRegisterFee(values)
      setPlans(Object.fromEntries(PLAN_DEFS.map(p => [p.key, {
        fee: String(res?.data?.[p.key]?.fee ?? values[p.key].fee),
        enabled: res?.data?.[p.key]?.enabled ?? values[p.key].enabled,
      }])))
      toast.success('Registration fee settings saved successfully')
    } catch (err) {
      const msg = err.message || 'Unable to update registration fees'
      setError(msg); toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  // ── Save Payment Info ──────────────────────────────────────────────────────
  const addAccount = () => setAccounts(prev => [
    ...prev, { id: String(Date.now()), bank: BANK_OPTIONS[0], accountName: '', accountNumber: '' }
  ])

  const updateAccount = (id, field, value) =>
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a))

  const removeAccount = (id) => setAccounts(prev => prev.filter(a => a.id !== id))

  const handleSavePayment = async () => {
    if (!telegramUsername.trim()) { setPayError('Telegram username is required'); return }
    if (accounts.some(a => !a.bank || !a.accountName.trim() || !a.accountNumber.trim())) {
      setPayError('All account fields are required'); return
    }
    setPaySaving(true); setPayError('')
    try {
      await manageApi.updatePaymentInfo({ telegramUsername: telegramUsername.trim(), accounts })
      toast.success('Payment information saved successfully')
    } catch (err) {
      const msg = err.message || 'Failed to save payment info'
      setPayError(msg); toast.error(msg)
    } finally {
      setPaySaving(false)
    }
  }

  const enabledCount = Object.values(plans).filter(p => p.enabled).length

  const tabClass = (tab) =>
    `px-5 py-2 text-sm font-semibold rounded-xl transition-all ${
      activeTab === tab
        ? 'bg-violet-600 text-white shadow-md shadow-violet-300/40'
        : 'text-slate-600 hover:bg-slate-100'
    }`

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
              Registration Fees & Payment
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage onboarding pricing, bank accounts for payments, and Telegram receipt collection.
          </p>
        </div>
      </div>

      {/* ── Tab Switcher ──────────────────────────────────────────────────── */}
      <div className="mb-6 flex gap-2 bg-white/80 backdrop-blur rounded-2xl p-1.5 border border-purple-100 shadow-sm w-fit">
        <button id="tab-plans" type="button" className={tabClass('plans')} onClick={() => setActiveTab('plans')}>
          💰 Plan Pricing
        </button>
        <button id="tab-account-details" type="button" className={tabClass('accounts')} onClick={() => setActiveTab('accounts')}>
          🏦 Account Details & Telegram
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: Plan Pricing
         ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'plans' && (
        <>
          {/* Status Banner */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-sm">ETB</div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Billing Currency</p>
                <p className="text-sm font-bold text-slate-800">Ethiopian Birr (ETB)</p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">{enabledCount}</div>
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

          <div className="flex justify-end gap-2 mb-4">
            <button type="button" onClick={fetchFee} disabled={loading || saving}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-purple-200/80 bg-white/80 hover:bg-white text-slate-700 shadow-sm transition-all active:scale-95 disabled:opacity-50">
              {loading ? <Spinner size="sm" /> : '↺'} {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button type="button" onClick={handleSave} disabled={loading || saving}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-md transition-all hover:shadow-lg active:scale-95 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}>
              {saving ? <><Spinner size="sm" className="border-white/30 border-t-white" /> Saving…</> : '✓ Save All Plans'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {PLAN_DEFS.map((plan) => {
              const current = plans[plan.key] || { fee: '0', enabled: true }
              const isEnabled = current.enabled
              const monthlyFee = isEnabled && Number(current.fee) > 0 ? (Number(current.fee) / plan.months).toFixed(1) : null
              return (
                <div key={plan.key} className={`bg-white rounded-2xl border transition-all duration-200 p-5 shadow-sm flex flex-col justify-between ${
                  isEnabled ? 'border-purple-200/90 hover:border-violet-300 hover:shadow-md' : 'border-slate-200/80 bg-slate-50/40 opacity-75'
                }`}>
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 font-heading">{plan.label}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-slate-100 text-slate-500'
                          }`}>{isEnabled ? 'Active' : 'Disabled'}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{plan.sub}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input type="checkbox" checked={isEnabled}
                          onChange={(e) => setPlans(cur => ({ ...cur, [plan.key]: { ...cur[plan.key], enabled: e.target.checked } }))}
                          disabled={loading || saving} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                      </label>
                    </div>
                    <div className="mt-4">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Registration Fee Amount</label>
                      <div className={`flex items-center border rounded-xl overflow-hidden transition-all bg-white ${
                        isEnabled ? 'border-slate-200 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100' : 'border-slate-200 bg-slate-50'
                      }`}>
                        <span className="px-3.5 py-3 bg-purple-50/70 text-violet-700 text-xs font-bold border-r border-slate-200 select-none">ETB</span>
                        <input type="number" min="0" step="0.01" value={current.fee}
                          onChange={(e) => setPlans(cur => ({ ...cur, [plan.key]: { ...cur[plan.key], fee: e.target.value } }))}
                          disabled={!isEnabled || loading || saving} placeholder="0.00"
                          className="w-full px-3.5 py-3 text-sm font-semibold outline-none bg-transparent text-slate-800 disabled:text-slate-400" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>Duration: {plan.months} {plan.months === 1 ? 'Month' : 'Months'}</span>
                    {monthlyFee && <span className="font-medium text-violet-700">≈ {monthlyFee} ETB / month</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: Account Details & Telegram
         ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'accounts' && (
        <div className="max-w-2xl">
          {payLoading && (
            <div className="flex items-center gap-3 py-8 text-slate-400 text-sm"><Spinner /> Loading payment info…</div>
          )}

          {payError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-medium flex items-center justify-between">
              <span>{payError}</span>
              <button onClick={() => setPayError('')} className="font-bold">✕</button>
            </div>
          )}

          {!payLoading && (
            <>
              {/* Telegram Username */}
              <div className="mb-6 bg-white rounded-2xl border border-purple-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">✈️</span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Telegram Receipt Collection</h2>
                    <p className="text-xs text-slate-500">Users will send payment screenshots to this Telegram account for verification.</p>
                  </div>
                </div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Telegram Username</label>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100 bg-white">
                  <span className="px-3.5 py-3 bg-blue-50 text-blue-600 font-bold text-sm border-r border-slate-200 select-none">@</span>
                  <input
                    id="telegram-username-input"
                    type="text"
                    value={telegramUsername.replace(/^@/, '')}
                    onChange={(e) => setTelegramUsername(e.target.value.replace(/^@/, ''))}
                    placeholder="your_telegram_username"
                    className="flex-1 px-3.5 py-3 text-sm font-semibold outline-none bg-transparent text-slate-800"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  The mobile app will show a "Send Screenshot" button that opens <code className="bg-slate-100 px-1 rounded">t.me/{telegramUsername || 'username'}</code>
                </p>
              </div>

              {/* Bank Accounts List */}
              <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏦</span>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Payment Accounts</h2>
                      <p className="text-xs text-slate-500">Bank & mobile money accounts users will transfer payment to.</p>
                    </div>
                  </div>
                  <button id="add-account-btn" type="button" onClick={addAccount}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-xl transition-all">
                    + Add Account
                  </button>
                </div>

                <div className="space-y-4">
                  {accounts.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                      No accounts yet. Click <strong>+ Add Account</strong> to add your first payment method.
                    </div>
                  )}

                  {accounts.map((acc, index) => (
                    <div key={acc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account #{index + 1}</span>
                        <button type="button" onClick={() => removeAccount(acc.id)}
                          className="text-red-400 hover:text-red-600 text-sm font-bold transition-colors">
                          ✕ Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Bank / Account Type</label>
                          <select value={acc.bank} onChange={(e) => updateAccount(acc.id, 'bank', e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium bg-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 text-slate-800">
                            {BANK_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Account Holder Full Name</label>
                          <input type="text" value={acc.accountName}
                            onChange={(e) => updateAccount(acc.id, 'accountName', e.target.value)}
                            placeholder="e.g. Shmeta Business PLC"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium bg-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 text-slate-800" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Account Number</label>
                          <input type="text" value={acc.accountNumber}
                            onChange={(e) => updateAccount(acc.id, 'accountNumber', e.target.value)}
                            placeholder="e.g. 1000234567890"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium bg-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 text-slate-800" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-6 flex justify-end">
                <button id="save-payment-info-btn" type="button" onClick={handleSavePayment} disabled={paySaving}
                  className="flex items-center gap-2 px-8 py-3 text-sm font-bold text-white rounded-xl shadow-md shadow-violet-300/40 transition-all hover:shadow-lg active:scale-95 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}>
                  {paySaving ? <><Spinner size="sm" className="border-white/30 border-t-white" /> Saving…</> : '✓ Save Payment Info'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </Layout>
  )
}
