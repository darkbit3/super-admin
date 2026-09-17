import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { api } from '../api/client'

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div>
        <p className="font-semibold text-slate-900">{label}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-violet-600' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

export default function Settings() {
  const [visibility, setVisibility] = useState({ hidePeople: false, hideGroups: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/chat/settings/visibility')
      .then((res) => setVisibility(res.data || { hidePeople: false, hideGroups: false }))
      .catch((err) => setError(err.message || 'Unable to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const res = await api.put('/chat/settings/visibility', visibility)
      setVisibility(res.data)
      setMessage('Chat visibility settings saved')
    } catch (err) {
      setError(err.message || 'Unable to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">Control Center</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Settings</h1>
          <p className="mt-2 text-slate-500">Control what appears in chat for every account.</p>
        </div>
        <div className="space-y-4">
          {loading ? <div className="rounded-2xl bg-white p-6 text-slate-500">Loading settings...</div> : (
            <>
              <Toggle
                checked={visibility.hidePeople}
                onChange={(value) => setVisibility((current) => ({ ...current, hidePeople: value }))}
                label="Hide people"
                description="Remove individual contacts from super-admin, admin, and mobile chat pages."
              />
              <Toggle
                checked={visibility.hideGroups}
                onChange={(value) => setVisibility((current) => ({ ...current, hideGroups: value }))}
                label="Hide groups"
                description="Remove group conversations from super-admin, admin, and mobile chat pages."
              />
              <div className="flex items-center justify-between gap-4 pt-3">
                <div>
                  {message && <p className="text-sm font-medium text-emerald-600">{message}</p>}
                  {error && <p className="text-sm font-medium text-red-600">{error}</p>}
                </div>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving || loading}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save settings'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
