import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { manageApi } from '../api/manageApi'
import { useToast } from '../context/ToastContext'

const ACCENT = '#7C3AED'
const PLAN_DEFS = [
  ['oneMonth', 'Free for 1 month'],
  ['twoMonths', 'Free for 2 months'],
  ['threeMonths', 'Free for 3 months'],
  ['sixMonths', 'Free for 6 months'],
  ['oneYear', 'Free for 1 year'],
]

const emptyPlans = Object.fromEntries(PLAN_DEFS.map(([key]) => [key, { fee: '', enabled: true }]))

export default function RegisterFee() {
  const toast = useToast()
  const [plans, setPlans] = useState(emptyPlans)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchFee = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await manageApi.getRegisterFee()
      setPlans(Object.fromEntries(PLAN_DEFS.map(([key]) => [key, {
        fee: String(response?.[key]?.fee ?? 0),
        enabled: response?.[key]?.enabled !== false,
      }])))
    } catch (err) {
      const message = err.message || 'Failed to load register fee'
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
      setError('Each register fee must be a valid non-negative number')
      return
    }

    setSaving(true)
    setError('')
    try {
      const response = await manageApi.updateRegisterFee(values)
      setPlans(Object.fromEntries(PLAN_DEFS.map(([key]) => [key, {
        fee: String(response?.data?.[key]?.fee ?? values[key].fee),
        enabled: response?.data?.[key]?.enabled ?? values[key].enabled,
      }])))
      toast.success('Register fee updated successfully')
    } catch (err) {
      const message = err.message || 'Unable to update register fee'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>System Setting</p>
            <h1 className="text-2xl font-bold mt-2" style={{ color: '#1A0A2E' }}>Register Fee</h1>
          </div>
          <button
            type="button"
            onClick={fetchFee}
            disabled={loading || saving}
            className="px-4 py-2 rounded-xl border text-sm font-medium transition disabled:opacity-50"
            style={{ borderColor: '#DDD0F0', backgroundColor: 'white', color: '#3A2A4A' }}
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border p-5 sm:p-6" style={{ borderColor: '#DDD0F0' }}>
        <div className="mb-6">
          <p className="text-sm font-medium" style={{ color: '#3A2A4A' }}>Registration plan prices</p>
          <p className="mt-1 text-sm" style={{ color: '#7A6A8A' }}>Turn plans on or off and set the amount for each free-period option.</p>
        </div>

        <div className="max-w-lg space-y-4">
          {PLAN_DEFS.map(([key, label]) => (
            <div key={key} className="border rounded-xl p-4" style={{ borderColor: '#DDD0F0' }}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <label className="text-sm font-medium" style={{ color: '#3A2A4A' }}>{label}</label>
                <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: plans[key].enabled ? '#15803D' : '#7A6A8A' }}>
                  <input
                    type="checkbox"
                    checked={plans[key].enabled}
                    onChange={(e) => setPlans(current => ({ ...current, [key]: { ...current[key], enabled: e.target.checked } }))}
                    disabled={loading || saving}
                    className="w-4 h-4 accent-violet-600"
                  />
                  {plans[key].enabled ? 'On' : 'Off'}
                </label>
              </div>
              <div className="flex items-center border rounded-xl overflow-hidden" style={{ borderColor: '#DDD0F0' }}>
                <span className="px-3 py-3 text-sm font-semibold" style={{ backgroundColor: '#F5F1FF', color: ACCENT }}>ETB</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={plans[key].fee}
                  onChange={(e) => setPlans(current => ({ ...current, [key]: { ...current[key], fee: e.target.value } }))}
                  disabled={loading || saving}
                  placeholder="0.00"
                  className="w-full px-3 py-3 text-sm outline-none bg-white"
                  style={{ color: '#1A0A2E' }}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleSave}
            disabled={loading || saving}
            className="w-full sm:w-auto px-5 py-3 rounded-xl font-semibold transition disabled:opacity-60"
            style={{ backgroundColor: ACCENT, color: 'white' }}
          >
            {saving ? 'Saving…' : 'Save Register Fee'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
