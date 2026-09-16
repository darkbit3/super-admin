import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { manageApi } from '../api/manageApi'
import { useToast } from '../context/ToastContext'

const ACCENT = '#7C3AED'

export default function RegisterFee() {
  const toast = useToast()
  const [fee, setFee] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchFee = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await manageApi.getRegisterFee()
      setFee(String(response?.fee ?? 0))
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
    const raw = Number(fee)
    if (!Number.isFinite(raw) || raw < 0) {
      setError('Register fee must be a valid non-negative number')
      return
    }

    setSaving(true)
    setError('')
    try {
      const response = await manageApi.updateRegisterFee(raw)
      setFee(String(response?.data?.fee ?? raw))
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
          <p className="text-sm font-medium" style={{ color: '#3A2A4A' }}>Registration price charged to new user accounts</p>
          <p className="mt-1 text-sm" style={{ color: '#7A6A8A' }}>Set the one-time fee users must pay when they register.</p>
        </div>

        <div className="max-w-lg space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#3A2A4A' }}>Fee Amount</label>
            <div className="flex items-center border rounded-xl overflow-hidden" style={{ borderColor: '#DDD0F0' }}>
              <span className="px-3 py-3 text-sm font-semibold" style={{ backgroundColor: '#F5F1FF', color: ACCENT }}>ETB</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                disabled={loading || saving}
                placeholder="0.00"
                className="w-full px-3 py-3 text-sm outline-none bg-white"
                style={{ color: '#1A0A2E' }}
              />
            </div>
          </div>

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
