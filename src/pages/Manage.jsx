import { useState, useRef, useEffect, useCallback } from 'react'
import Layout from '../components/Layout'
import { manageApi } from '../api/manageApi'
import { useToast } from '../context/ToastContext'

// ── Icons ──────────────────────────────────────────────────────────────────
const IconAdd = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
)
const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828A2 2 0 0110.414 16H8v-2.414a2 2 0 01.586-1.414z" />
  </svg>
)
const IconDelete = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1h-4a1 1 0 00-1 1m-4 0h10" />
  </svg>
)
const IconKey = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4.418 0-8 1.79-8 4v1h16v-1c0-2.21-3.582-4-8-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 11h4m-2-2v4" />
  </svg>
)
const IconToggleOn = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 7H7a5 5 0 000 10h10a5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6z"/>
  </svg>
)
const IconToggleOff = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 7H7a5 5 0 000 10h10a5 5 0 000-10zm-10 8a3 3 0 110-6 3 3 0 010 6z"/>
  </svg>
)
const IconRefresh = ({ spinning }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

// ── Helpers ────────────────────────────────────────────────────────────────
const ACCENT = '#7C3AED'

function fmtDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return iso }
}

function getFieldErrors(error) {
  const fieldErrors = {}
  if (Array.isArray(error.errors)) {
    error.errors.forEach(({ field, message }) => { fieldErrors[field] = message })
  }
  return fieldErrors
}

// ── Modal wrapper ──────────────────────────────────────────────────────────
function Modal({ onClose, children }) {
  const overlayRef = useRef(null)
  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
    >
      {children}
    </div>
  )
}

function ModalPanel({ children }) {
  return (
    <div className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-xl overflow-y-auto"
      style={{ maxHeight: '95dvh', borderRadius: '1rem 1rem 0 0' }}>
      {children}
    </div>
  )
}

// ── Confirm delete modal ───────────────────────────────────────────────────
function ConfirmDeleteModal({ message, subMessage, onConfirm, onCancel, loading }) {
  return (
    <Modal onClose={onCancel}>
      <ModalPanel>
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1h-4a1 1 0 00-1 1m-4 0h10" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">{message}</h2>
          {subMessage && <p className="text-sm text-gray-500 mb-6">{subMessage}</p>}
          {!subMessage && <div className="mb-6" />}
          <div className="flex gap-3">
            <button onClick={onCancel} disabled={loading}
              className="flex-1 px-4 py-3 text-sm border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 min-h-[44px]">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 px-4 py-3 text-sm bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 min-h-[44px]">
              {loading ? 'Deleting…' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </ModalPanel>
    </Modal>
  )
}

// ── Phone input ────────────────────────────────────────────────────────────
function PhoneInput({ value, onChange, error }) {
  const handleChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '')
    if (raw.startsWith('0')) raw = raw.slice(1)
    if (raw.length === 1 && raw !== '9' && raw !== '7') return
    if (raw.length > 9) return
    onChange(raw)
  }
  return (
    <>
      <div className={`flex items-center border rounded-xl overflow-hidden ${error ? 'border-red-400' : 'border-gray-300'}`}>
        <span className="px-3 py-3 bg-gray-50 text-gray-500 text-sm font-medium border-r border-gray-300 select-none">0</span>
        <input type="tel" value={value} onChange={handleChange}
          placeholder="9xxxxxxxx  or  7xxxxxxxx" inputMode="numeric" maxLength={9}
          className="flex-1 px-3 py-3 text-sm outline-none bg-white min-h-[44px]" />
      </div>
      <p className="text-xs text-gray-400 mt-1">Format: 09xxxxxxxxx or 07xxxxxxxxx</p>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </>
  )
}

// ── Password field ─────────────────────────────────────────────────────────
function PasswordInput({ value, onChange, show, onToggle, error }) {
  return (
    <>
      <div className={`flex items-center border rounded-xl overflow-hidden ${error ? 'border-red-400' : 'border-gray-300'}`}>
        <input type={show ? 'text' : 'password'} value={value} onChange={onChange}
          placeholder="••••••••" className="flex-1 px-3 py-3 text-sm outline-none bg-white min-h-[44px]" />
        <button type="button" onClick={onToggle}
          className="px-3 text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center">
          {show ? <EyeOff /> : <EyeOn />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </>
  )
}

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
      {status}
    </span>
  )
}

const emptyAddForm  = { name: '', phone: '', password: '', confirmPassword: '' }
const emptyEditForm = { name: '', phone: '' }

// ── Main component ─────────────────────────────────────────────────────────
export default function Manage() {
  const toast = useToast()
  const [admins, setAdmins]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [apiError, setApiError]       = useState('')
  const [selected, setSelected]       = useState([])
  const [showAddModal,   setShowAddModal]   = useState(false)
  const [showEditModal,  setShowEditModal]  = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [confirmDelete,  setConfirmDelete]  = useState(null)
  const [deleteLoading,  setDeleteLoading]  = useState(false)

  const [addForm,        setAddForm]        = useState(emptyAddForm)
  const [addErrors,      setAddErrors]      = useState({})
  const [showAddPwd,     setShowAddPwd]     = useState(false)
  const [showAddConfirm, setShowAddConfirm] = useState(false)

  const [editForm,   setEditForm]   = useState(emptyEditForm)
  const [editErrors, setEditErrors] = useState({})
  const [editTarget, setEditTarget] = useState(null)

  const [resetTargetIds,   setResetTargetIds]   = useState([])
  const [resetForm,        setResetForm]         = useState({ password: '', confirmPassword: '' })
  const [resetErrors,      setResetErrors]       = useState({})
  const [showResetPwd,     setShowResetPwd]      = useState(false)
  const [showResetConfirm, setShowResetConfirm]  = useState(false)

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchAdmins = useCallback(async () => {
    setLoading(true); setApiError('')
    try {
      const data = await manageApi.getAll()
      setAdmins(data)
    } catch (err) {
      setApiError(err.message || 'Failed to load admins')
      toast.error(err.message || 'Failed to load admins')
    } finally { setLoading(false) }
  }, [toast])

  useEffect(() => { fetchAdmins() }, [fetchAdmins])

  const selCount    = selected.length
  const allChecked  = admins.length > 0 && admins.every(a => selected.includes(a.id))
  const someChecked = admins.some(a => selected.includes(a.id))

  const toggleRow = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  const toggleAll = () => setSelected(allChecked ? [] : admins.map(a => a.id))

  // ── Add ──────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setAddForm(emptyAddForm); setAddErrors({})
    setShowAddPwd(false); setShowAddConfirm(false); setShowAddModal(true)
  }
  const handleAdd = async () => {
    const errs = {}
    if (!addForm.name) errs.name = 'Name is required'
    if (!addForm.phone || addForm.phone.length !== 9) errs.phone = 'Enter a valid 10-digit number (09/07)'
    if (!addForm.password) errs.password = 'Password is required'
    else if (addForm.password.length < 6) errs.password = 'Minimum 6 characters'
    if (!addForm.confirmPassword) errs.confirmPassword = 'Please confirm password'
    else if (addForm.password !== addForm.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (Object.keys(errs).length > 0) { setAddErrors(errs); return }
    try {
      const { confirmPassword, ...rest } = addForm
      await manageApi.create({ ...rest, phone: '0' + addForm.phone })
      await fetchAdmins(); setShowAddModal(false)
      toast.success('Admin created successfully')
    } catch (err) {
      const fieldErrors = getFieldErrors(err)
      if (err.status === 409) fieldErrors.phone = err.message
      if (Object.keys(fieldErrors).length > 0) setAddErrors(fieldErrors)
      else toast.error(err.message)
    }
  }

  // ── Edit ─────────────────────────────────────────────────────────────────
  const openEdit = (adminId) => {
    const id = adminId ?? (selCount === 1 ? selected[0] : null)
    if (!id) return
    const admin = admins.find(a => a.id === id)
    setEditTarget(admin)
    const stripped = admin.phone.startsWith('0') ? admin.phone.slice(1) : admin.phone
    setEditForm({ name: admin.name, phone: stripped })
    setEditErrors({})
    setShowEditModal(true)
  }
  const handleEdit = async () => {
    if (!editForm.name || editForm.phone.length !== 9) return
    try {
      await manageApi.update(editTarget.id, { name: editForm.name, phone: '0' + editForm.phone })
      await fetchAdmins(); setShowEditModal(false)
      toast.success('Admin updated successfully')
    } catch (err) {
      const fieldErrors = getFieldErrors(err)
      if (err.status === 409) fieldErrors.phone = err.message
      if (Object.keys(fieldErrors).length > 0) setEditErrors(fieldErrors)
      else toast.error(err.message)
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  const openDelete = (ids) => {
    const names = ids.map(id => admins.find(a => a.id === id)?.name).filter(Boolean)
    setConfirmDelete({
      ids,
      message: `Delete ${ids.length} admin${ids.length > 1 ? 's' : ''}?`,
      subMessage: ids.length === 1
        ? `"${names[0]}" will be permanently removed.`
        : `${names.slice(0, 3).join(', ')}${names.length > 3 ? ` and ${names.length - 3} more` : ''} will be permanently removed.`,
    })
  }
  const handleConfirmDelete = async () => {
    if (!confirmDelete) return
    setDeleteLoading(true)
    try {
      await manageApi.bulkDelete(confirmDelete.ids)
      await fetchAdmins(); setSelected([]); setConfirmDelete(null)
      toast.success(`${confirmDelete.ids.length} admin(s) deleted`)
    } catch (err) { toast.error(err.message) }
    finally { setDeleteLoading(false) }
  }

  // ── Status toggle ────────────────────────────────────────────────────────
  const handleRowToggle = async (admin) => {
    const newStatus = admin.status === 'Active' ? 'Inactive' : 'Active'
    try {
      await manageApi.updateStatus(admin.id, newStatus)
      await fetchAdmins()
      toast.success(`${admin.name} set to ${newStatus}`)
    } catch (err) {
      const fieldErrors = getFieldErrors(err)
      if (Object.keys(fieldErrors).length > 0) setResetErrors(fieldErrors)
      else toast.error(err.message)
    }
  }
  const handleToggleSelected = async () => {
    if (selCount === 0) return
    const allActive = selected.every(id => admins.find(a => a.id === id)?.status === 'Active')
    const newStatus = allActive ? 'Inactive' : 'Active'
    try {
      await manageApi.bulkStatus(selected, newStatus); await fetchAdmins()
      toast.success(`${selCount} admin(s) set to ${newStatus}`)
    } catch (err) { toast.error(err.message) }
  }
  const selectedAllActive = selCount > 0 && selected.every(id => admins.find(a => a.id === id)?.status === 'Active')

  // ── Reset password ───────────────────────────────────────────────────────
  const openReset = (ids) => {
    setResetTargetIds(ids)
    setResetForm({ password: '', confirmPassword: '' })
    setResetErrors({}); setShowResetPwd(false); setShowResetConfirm(false); setShowResetModal(true)
  }
  const handleResetSave = async () => {
    const errs = {}
    if (!resetForm.password) errs.password = 'Password is required'
    else if (resetForm.password.length < 6) errs.password = 'Minimum 6 characters'
    if (!resetForm.confirmPassword) errs.confirmPassword = 'Please confirm password'
    else if (resetForm.password !== resetForm.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (Object.keys(errs).length > 0) { setResetErrors(errs); return }
    try {
      await manageApi.bulkResetPassword(resetTargetIds, resetForm.password)
      await fetchAdmins(); setShowResetModal(false); setSelected([])
      toast.success(`Password reset for ${resetTargetIds.length} admin(s)`)
    } catch (err) { toast.error(err.message) }
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#1A0A2E', fontFamily: 'Georgia, serif' }}>Manage Admins</h1>
          <p className="text-sm mt-0.5" style={{ color: '#7A6A8A' }}>
            {admins.length} total · {admins.filter(a => a.status === 'Active').length} active
            {selCount > 0 && <span className="ml-2 font-semibold" style={{ color: ACCENT }}>· {selCount} selected</span>}
          </p>
        </div>
        <button onClick={fetchAdmins} disabled={loading} aria-label="Reload"
          className="flex items-center justify-center gap-1.5 rounded-xl border transition-colors disabled:opacity-50 w-11 h-11 sm:w-auto sm:h-auto sm:px-3 sm:py-2"
          style={{ backgroundColor: 'white', borderColor: '#DDD0F0', color: '#3A2A4A' }}>
          <IconRefresh spinning={loading} />
          <span className="hidden sm:inline text-sm font-medium">{loading ? 'Loading…' : 'Reload'}</span>
        </button>
      </div>

      {/* Bulk action bar */}
      {selCount > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 p-3 rounded-xl border"
          style={{ backgroundColor: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.25)' }}>
          <span className="text-sm font-semibold self-center mr-1" style={{ color: '#5B21B6' }}>{selCount} selected</span>
          <button onClick={() => openEdit()} disabled={selCount !== 1}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors min-h-[36px] ${selCount === 1 ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700' : 'bg-indigo-50 text-indigo-300 border-indigo-100 cursor-not-allowed'}`}>
            <IconEdit /> Edit
          </button>
          <button onClick={() => openDelete([...selected])}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border bg-red-500 text-white border-red-500 hover:bg-red-600 transition-colors min-h-[36px]">
            <IconDelete /> Delete{selCount > 1 ? ` (${selCount})` : ''}
          </button>
          <button onClick={handleToggleSelected}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors min-h-[36px] ${selectedAllActive ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' : 'bg-gray-400 text-white border-gray-400 hover:bg-gray-500'}`}>
            {selectedAllActive ? <IconToggleOn /> : <IconToggleOff />}
            {selectedAllActive ? 'Active' : 'Inactive'}
          </button>
          <button onClick={() => openReset([...selected])}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600 transition-colors min-h-[36px]">
            <IconKey /> Reset Pwd{selCount > 1 ? ` (${selCount})` : ''}
          </button>
          <button onClick={() => setSelected([])}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors min-h-[36px] ml-auto">
            ✕ Clear
          </button>
        </div>
      )}

      {apiError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{apiError}</div>
      )}

      {/* ── Mobile: card list ─────────────────────────────────────────────── */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse" style={{ border: '1px solid #DDD0F0' }}>
              <div className="h-4 w-1/2 rounded mb-2" style={{ backgroundColor: '#DDD0F0' }} />
              <div className="h-3 w-1/3 rounded" style={{ backgroundColor: '#F0EAF8' }} />
            </div>
          ))
        ) : admins.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No admins found</div>
        ) : (
          admins.map(admin => {
            const isSelected = selected.includes(admin.id)
            return (
              <div key={admin.id} className="bg-white rounded-2xl p-4 transition-all"
                style={{ border: isSelected ? `2px solid ${ACCENT}` : '1px solid #DDD0F0', boxShadow: isSelected ? `0 0 0 3px rgba(124,58,237,0.12)` : '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={isSelected} onChange={() => toggleRow(admin.id)}
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 cursor-pointer flex-shrink-0" style={{ accentColor: ACCENT }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: '#1A0A2E' }}>{admin.name}</span>
                      <StatusBadge status={admin.status} />
                    </div>
                    <p className="text-xs mt-0.5 font-mono" style={{ color: '#7A6A8A' }}>{admin.phone}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#A090B0' }}>Joined {fmtDate(admin.created_at)}</p>
                  </div>
                </div>
                <div className="mt-3 ml-8 flex items-center gap-2">
                  <button onClick={() => openEdit(admin.id)} className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors" title="Edit"><IconEdit /></button>
                  <button onClick={() => openDelete([admin.id])} className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Delete"><IconDelete /></button>
                  <button onClick={() => handleRowToggle(admin)}
                    className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors ${admin.status === 'Active' ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    title={admin.status === 'Active' ? 'Deactivate' : 'Activate'}>
                    {admin.status === 'Active' ? <IconToggleOn /> : <IconToggleOff />}
                  </button>
                  <button onClick={() => openReset([admin.id])} className="flex items-center justify-center w-9 h-9 rounded-xl bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors" title="Reset password"><IconKey /></button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Desktop table ─────────────────────────────────────────────────── */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-x-auto" style={{ border: '1px solid #DDD0F0' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors" style={{ backgroundColor: ACCENT }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#6D28D9'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = ACCENT}>
              <IconAdd /> Add Admin
            </button>
            <button onClick={() => openEdit()} disabled={selCount !== 1}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${selCount === 1 ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700' : 'bg-indigo-50 text-indigo-300 border-indigo-100 cursor-not-allowed'}`}>
              <IconEdit /> Edit
            </button>
            <button onClick={() => selCount > 0 && openDelete([...selected])} disabled={selCount === 0}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${selCount > 0 ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' : 'bg-red-50 text-red-300 border-red-100 cursor-not-allowed'}`}>
              <IconDelete /> Delete{selCount > 1 ? ` (${selCount})` : ''}
            </button>
            <button onClick={handleToggleSelected} disabled={selCount === 0}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${selCount > 0 ? (selectedAllActive ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' : 'bg-gray-400 text-white border-gray-400 hover:bg-gray-500') : 'bg-green-50 text-green-300 border-green-100 cursor-not-allowed'}`}>
              {selectedAllActive ? <IconToggleOn /> : <IconToggleOff />}
              {selCount > 0 ? (selectedAllActive ? 'Active' : 'Inactive') : 'Active'}
            </button>
            <button onClick={() => selCount > 0 && openReset([...selected])} disabled={selCount === 0}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${selCount > 0 ? 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600' : 'bg-yellow-50 text-yellow-300 border-yellow-100 cursor-not-allowed'}`}>
              <IconKey /> Reset Pwd{selCount > 1 ? ` (${selCount})` : ''}
            </button>
          </div>
        </div>

        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allChecked}
                  ref={el => { if (el) el.indeterminate = someChecked && !allChecked }}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer" style={{ accentColor: ACCENT }} />
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Phone</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Joined</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading…</td></tr>
            ) : admins.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">No admins found</td></tr>
            ) : (
              admins.map(admin => {
                const isSelected = selected.includes(admin.id)
                return (
                  <tr key={admin.id} onClick={() => toggleRow(admin.id)}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-purple-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleRow(admin.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer" style={{ accentColor: ACCENT }} />
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-800">{admin.name}</td>
                    <td className="px-4 py-4 text-gray-500">{admin.phone}</td>
                    <td className="px-4 py-4"><StatusBadge status={admin.status} /></td>
                    <td className="px-4 py-4 text-gray-400 text-xs">{fmtDate(admin.created_at)}</td>
                    <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button onClick={() => openEdit(admin.id)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"><IconEdit /> Edit</button>
                        <button onClick={() => openDelete([admin.id])} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><IconDelete /> Delete</button>
                        <button onClick={() => handleRowToggle(admin)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${admin.status === 'Active' ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-500 bg-gray-100 hover:bg-gray-200'}`}>
                          {admin.status === 'Active' ? <IconToggleOn /> : <IconToggleOff />}
                          {admin.status === 'Active' ? 'Active' : 'Inactive'}
                        </button>
                        <button onClick={() => openReset([admin.id])} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"><IconKey /> Reset</button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile FAB */}
      <button onClick={openAdd}
        className="lg:hidden fixed z-30 flex items-center gap-2 px-5 py-3.5 rounded-full shadow-lg font-semibold text-sm transition-all active:scale-95"
        style={{ backgroundColor: ACCENT, color: '#fff', bottom: 'calc(64px + env(safe-area-inset-bottom) + 16px)', right: '16px', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
        <IconAdd /> Add Admin
      </button>

      {/* ── Add Admin Modal ──────────────────────────────────────────────── */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <ModalPanel>
            <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Add New Admin</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">✕</button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(95dvh - 120px)' }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Abebe Kebede"
                  className={`w-full border rounded-xl px-3 py-3 text-sm outline-none min-h-[44px] ${addErrors.name ? 'border-red-400' : 'border-gray-300'} focus:ring-2`}
                  style={{ '--tw-ring-color': ACCENT }} />
                {addErrors.name && <p className="text-xs text-red-500 mt-1">{addErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <PhoneInput value={addForm.phone} onChange={v => setAddForm(f => ({ ...f, phone: v }))} error={addErrors.phone} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <PasswordInput value={addForm.password} onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
                  show={showAddPwd} onToggle={() => setShowAddPwd(v => !v)} error={addErrors.password} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                <PasswordInput value={addForm.confirmPassword} onChange={e => setAddForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  show={showAddConfirm} onToggle={() => setShowAddConfirm(v => !v)} error={addErrors.confirmPassword} />
              </div>
            </div>
            <div className="px-5 pb-5 pt-3 flex gap-3 border-t border-gray-100">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors min-h-[44px]">Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-3 text-white rounded-xl text-sm font-semibold transition-colors min-h-[44px]" style={{ backgroundColor: ACCENT }}>Add Admin</button>
            </div>
          </ModalPanel>
        </Modal>
      )}

      {/* ── Edit Admin Modal ─────────────────────────────────────────────── */}
      {showEditModal && (
        <Modal onClose={() => setShowEditModal(false)}>
          <ModalPanel>
            <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Edit Admin</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className={`w-full border rounded-xl px-3 py-3 text-sm outline-none min-h-[44px] ${editErrors.name ? 'border-red-400' : 'border-gray-300'}`} />
                {editErrors.name && <p className="text-xs text-red-500 mt-1">{editErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <PhoneInput value={editForm.phone} onChange={v => setEditForm(f => ({ ...f, phone: v }))} error={editErrors.phone} />
              </div>
            </div>
            <div className="px-5 pb-5 pt-3 flex gap-3 border-t border-gray-100">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors min-h-[44px]">Cancel</button>
              <button onClick={handleEdit} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors min-h-[44px]">Save Changes</button>
            </div>
          </ModalPanel>
        </Modal>
      )}

      {/* ── Reset Password Modal ─────────────────────────────────────────── */}
      {showResetModal && (
        <Modal onClose={() => setShowResetModal(false)}>
          <ModalPanel>
            <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Reset Password</h2>
              <button onClick={() => setShowResetModal(false)} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <PasswordInput value={resetForm.password} onChange={e => setResetForm(f => ({ ...f, password: e.target.value }))}
                  show={showResetPwd} onToggle={() => setShowResetPwd(v => !v)} error={resetErrors.password} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                <PasswordInput value={resetForm.confirmPassword} onChange={e => setResetForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  show={showResetConfirm} onToggle={() => setShowResetConfirm(v => !v)} error={resetErrors.confirmPassword} />
              </div>
            </div>
            <div className="px-5 pb-5 pt-3 flex gap-3 border-t border-gray-100">
              <button onClick={() => setShowResetModal(false)} className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors min-h-[44px]">Cancel</button>
              <button onClick={handleResetSave} className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-semibold transition-colors min-h-[44px]">Reset Password</button>
            </div>
          </ModalPanel>
        </Modal>
      )}

      {/* ── Confirm Delete Modal ─────────────────────────────────────────── */}
      {confirmDelete && (
        <ConfirmDeleteModal
          message={confirmDelete.message}
          subMessage={confirmDelete.subMessage}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
          loading={deleteLoading}
        />
      )}
    </Layout>
  )
}
