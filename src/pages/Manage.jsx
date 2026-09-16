import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import Layout from '../components/Layout'
import { manageApi } from '../api/manageApi'
import { useToast } from '../context/ToastContext'
import { Spinner, TableSkeletonRows, ListSkeleton } from '../components/Loaders'

// ── Icons ──────────────────────────────────────────────────────────────────
const EyeOn = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)
const EyeOff = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
)
const IconAdd = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
)
const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828A2 2 0 0110.414 16H8v-2.414a2 2 0 01.586-1.414z" />
  </svg>
)
const IconDelete = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1h-4a1 1 0 00-1 1m-4 0h10" />
  </svg>
)
const IconKey = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
const IconRefresh = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)
const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)
const IconShield = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

function getFieldErrors(error) {
  const fieldErrors = {}
  if (Array.isArray(error.errors)) {
    error.errors.forEach(({ field, message }) => { fieldErrors[field] = message })
  }
  return fieldErrors
}

function getInitials(name) {
  if (!name) return 'A'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

// ── Modal wrapper ──────────────────────────────────────────────────────────
function Modal({ onClose, children }) {
  const overlayRef = useRef(null)
  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-200"
    >
      {children}
    </div>
  )
}

function ModalPanel({ children, title, subtitle, onClose }) {
  return (
    <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-purple-100 flex flex-col max-h-[92dvh] animate-in fade-in zoom-in-95 duration-150">
      <div className="px-6 py-4 border-b border-purple-100/70 flex items-center justify-between bg-gradient-to-r from-purple-50/50 to-white">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="overflow-y-auto flex-1">{children}</div>
    </div>
  )
}

// ── Confirm delete modal ───────────────────────────────────────────────────
function ConfirmDeleteModal({ message, subMessage, onConfirm, onCancel, loading }) {
  return (
    <Modal onClose={onCancel}>
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-red-100 p-6 text-center animate-in fade-in zoom-in-95 duration-150">
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1h-4a1 1 0 00-1 1m-4 0h10" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1.5">{message}</h2>
        {subMessage && <p className="text-xs text-slate-500 mb-6 leading-relaxed">{subMessage}</p>}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-md shadow-red-500/20 disabled:opacity-50"
          >
              {loading ? <span className="inline-flex items-center gap-2"><Spinner size="sm" className="border-white/30 border-t-white" /> Deleting…</span> : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Phone input ────────────────────────────────────────────────────────────
function PhoneInput({ value, onChange, error }) {
  const handleChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '')
    if (raw.startsWith('251')) raw = raw.slice(3)
    if (raw.startsWith('0')) raw = raw.slice(1)
    if (raw.length === 1 && raw !== '9' && raw !== '7') return
    if (raw.length > 9) return
    onChange(raw)
  }
  return (
    <div>
      <div className={`flex items-center border rounded-xl overflow-hidden transition-all bg-white ${error ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100'}`}>
        <span className="px-3.5 py-2.5 bg-slate-50 text-slate-600 text-xs font-semibold border-r border-slate-200 select-none flex items-center gap-1">
          <span className="text-slate-400">ETH</span> 0
        </span>
        <input
          type="tel"
          value={value}
          onChange={handleChange}
          placeholder="9xxxxxxxx or 7xxxxxxxx"
          inputMode="numeric"
          maxLength={9}
          className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent text-slate-800 placeholder-slate-400"
        />
      </div>
      <p className="text-[11px] text-slate-400 mt-1">Ethiopian mobile format: 09... or 07... (9 digits)</p>
      {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
    </div>
  )
}

// ── Password field ─────────────────────────────────────────────────────────
function PasswordInput({ value, onChange, show, onToggle, error, placeholder = "••••••••" }) {
  return (
    <div>
      <div className={`flex items-center border rounded-xl overflow-hidden transition-all bg-white ${error ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100'}`}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="flex-1 px-3.5 py-2.5 text-sm outline-none bg-transparent text-slate-800 placeholder-slate-400"
        />
        <button
          type="button"
          onClick={onToggle}
          className="px-3 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {show ? <EyeOff /> : <EyeOn />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
    </div>
  )
}

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const isActive = status === 'Active'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
      isActive
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
        : 'bg-slate-100 text-slate-600 border border-slate-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
      {status}
    </span>
  )
}

const emptyAddForm  = { name: '', phone: '', email: '', password: '', confirmPassword: '' }
const emptyEditForm = { name: '', phone: '', email: '' }

// ── Main Component ─────────────────────────────────────────────────────────
export default function Manage() {
  const toast = useToast()
  const [admins, setAdmins]                 = useState([])
  const [loading, setLoading]               = useState(true)
  const [apiError, setApiError]             = useState('')
  const [selected, setSelected]             = useState([])
  const [searchQuery, setSearchQuery]       = useState('')
  const [statusFilter, setStatusFilter]     = useState('All')

  const [addLoading,     setAddLoading]     = useState(false)
  const [editLoading,    setEditLoading]    = useState(false)
  const [resetLoading,   setResetLoading]   = useState(false)
  const [showAddModal,   setShowAddModal]   = useState(false)
  const [showEditModal,  setShowEditModal]  = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [confirmDelete,  setConfirmDelete]  = useState(null)
  const [deleteLoading,  setDeleteLoading]  = useState(false)

  const [addForm,        setAddForm]        = useState(emptyAddForm)
  const [addErrors,      setAddErrors]      = useState({})
  const [showAddPwd,     setShowAddPwd]     = useState(false)
  const [showAddConfirm, setShowAddConfirm] = useState(false)

  const [editForm,       setEditForm]       = useState(emptyEditForm)
  const [editErrors,     setEditErrors]     = useState({})
  const [editTarget,     setEditTarget]     = useState(null)

  const [resetTargetIds,   setResetTargetIds]   = useState([])
  const [resetForm,        setResetForm]         = useState({ password: '', confirmPassword: '' })
  const [resetErrors,      setResetErrors]       = useState({})
  const [showResetPwd,     setShowResetPwd]      = useState(false)
  const [showResetConfirm, setShowResetConfirm]  = useState(false)

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchAdmins = useCallback(async () => {
    setLoading(true)
    setApiError('')
    try {
      const data = await manageApi.getAll()
      setAdmins(data || [])
    } catch (err) {
      setApiError(err.message || 'Failed to load admins')
      toast.error(err.message || 'Failed to load admins')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchAdmins()
  }, [fetchAdmins])

  // ── Filtered Admins ──────────────────────────────────────────────────────
  const filteredAdmins = useMemo(() => {
    return admins.filter(admin => {
      const matchesSearch =
        !searchQuery ||
        (admin.name && admin.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (admin.email && admin.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (admin.phone && admin.phone.includes(searchQuery))
      const matchesStatus =
        statusFilter === 'All' || admin.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [admins, searchQuery, statusFilter])

  const selCount    = selected.length
  const allChecked  = filteredAdmins.length > 0 && filteredAdmins.every(a => selected.includes(a.id))
  const someChecked = filteredAdmins.some(a => selected.includes(a.id))

  const toggleRow = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  const toggleAll = () => setSelected(allChecked ? [] : filteredAdmins.map(a => a.id))

  // ── Add ──────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setAddForm(emptyAddForm)
    setAddErrors({})
    setShowAddPwd(false)
    setShowAddConfirm(false)
    setShowAddModal(true)
  }

  const handleAdd = async () => {
    const errs = {}
    if (!addForm.name.trim()) errs.name = 'Full name is required'
    else if (addForm.name.trim().length < 2) errs.name = 'Name must be at least 2 characters'
    if (!addForm.phone || addForm.phone.length !== 9) errs.phone = 'Enter a valid 9-digit number starting with 9 or 7'
    if (!addForm.email || !addForm.email.trim()) {
      errs.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email.trim())) {
      errs.email = 'Enter a valid email address (e.g. admin@shmeta.com)'
    }
    if (!addForm.password) errs.password = 'Password is required'
    else if (addForm.password.length < 6) errs.password = 'Minimum 6 characters'
    if (!addForm.confirmPassword) errs.confirmPassword = 'Please confirm password'
    else if (addForm.password !== addForm.confirmPassword) errs.confirmPassword = 'Passwords do not match'

    if (Object.keys(errs).length > 0) {
      setAddErrors(errs)
      return
    }

    setAddLoading(true)
    try {
      const { confirmPassword, ...rest } = addForm
      await manageApi.create({
        ...rest,
        phone: '0' + addForm.phone,
        email: addForm.email.trim().toLowerCase(),
      })
      await fetchAdmins()
      setShowAddModal(false)
      toast.success('Admin account created successfully')
    } catch (err) {
      const fieldErrors = getFieldErrors(err)
      if (err.status === 409) {
        if (err.message && err.message.toLowerCase().includes('email')) {
          fieldErrors.email = err.message
        } else {
          fieldErrors.phone = err.message
        }
      }
      if (Object.keys(fieldErrors).length > 0) {
        setAddErrors(fieldErrors)
      } else {
        toast.error(err.message)
      }
    } finally {
      setAddLoading(false)
    }
  }

  // ── Edit ─────────────────────────────────────────────────────────────────
  const openEdit = (adminId) => {
    const id = adminId ?? (selCount === 1 ? selected[0] : null)
    if (!id) return
    const admin = admins.find(a => a.id === id)
    if (!admin) return
    setEditTarget(admin)
    const stripped = admin.phone.startsWith('0') ? admin.phone.slice(1) : admin.phone
    setEditForm({ name: admin.name, phone: stripped, email: admin.email || '' })
    setEditErrors({})
    setShowEditModal(true)
  }

  const handleEdit = async () => {
    const errs = {}
    if (!editForm.name.trim()) errs.name = 'Full name is required'
    else if (editForm.name.trim().length < 2) errs.name = 'Name must be at least 2 characters'
    if (!editForm.phone || editForm.phone.length !== 9) errs.phone = 'Enter a valid 9-digit number starting with 9 or 7'
    if (!editForm.email || !editForm.email.trim()) {
      errs.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())) {
      errs.email = 'Enter a valid email address (e.g. admin@shmeta.com)'
    }

    if (Object.keys(errs).length > 0) {
      setEditErrors(errs)
      return
    }

    setEditLoading(true)
    try {
      await manageApi.update(editTarget.id, {
        name: editForm.name.trim(),
        phone: '0' + editForm.phone,
        email: editForm.email.trim().toLowerCase(),
      })
      await fetchAdmins()
      setShowEditModal(false)
      toast.success('Admin details updated successfully')
    } catch (err) {
      const fieldErrors = getFieldErrors(err)
      if (err.status === 409) {
        if (err.message && err.message.toLowerCase().includes('email')) {
          fieldErrors.email = err.message
        } else {
          fieldErrors.phone = err.message
        }
      }
      if (Object.keys(fieldErrors).length > 0) {
        setEditErrors(fieldErrors)
      } else {
        toast.error(err.message)
      }
    } finally {
      setEditLoading(false)
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  const openDelete = (ids) => {
    const names = ids.map(id => admins.find(a => a.id === id)?.name).filter(Boolean)
    setConfirmDelete({
      ids,
      message: `Delete ${ids.length} admin${ids.length > 1 ? 's' : ''}?`,
      subMessage: ids.length === 1
        ? `"${names[0]}" will be permanently revoked and deleted from the platform.`
        : `${names.slice(0, 3).join(', ')}${names.length > 3 ? ` and ${names.length - 3} more` : ''} will be permanently removed.`,
    })
  }

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return
    setDeleteLoading(true)
    try {
      await manageApi.bulkDelete(confirmDelete.ids)
      await fetchAdmins()
      setSelected([])
      setConfirmDelete(null)
      toast.success(`${confirmDelete.ids.length} admin(s) deleted successfully`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── Status toggle ────────────────────────────────────────────────────────
  const handleRowToggle = async (admin) => {
    const newStatus = admin.status === 'Active' ? 'Inactive' : 'Active'
    try {
      await manageApi.updateStatus(admin.id, newStatus)
      await fetchAdmins()
      toast.success(`${admin.name} is now ${newStatus}`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleToggleSelected = async () => {
    if (selCount === 0) return
    const allActive = selected.every(id => admins.find(a => a.id === id)?.status === 'Active')
    const newStatus = allActive ? 'Inactive' : 'Active'
    try {
      await manageApi.bulkStatus(selected, newStatus)
      await fetchAdmins()
      toast.success(`${selCount} admin(s) set to ${newStatus}`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const selectedAllActive = selCount > 0 && selected.every(id => admins.find(a => a.id === id)?.status === 'Active')

  // ── Reset password ───────────────────────────────────────────────────────
  const openReset = (ids) => {
    setResetTargetIds(ids)
    setResetForm({ password: '', confirmPassword: '' })
    setResetErrors({})
    setShowResetPwd(false)
    setShowResetConfirm(false)
    setShowResetModal(true)
  }

  const handleResetSave = async () => {
    const errs = {}
    if (!resetForm.password) errs.password = 'Password is required'
    else if (resetForm.password.length < 6) errs.password = 'Minimum 6 characters'
    if (!resetForm.confirmPassword) errs.confirmPassword = 'Please confirm password'
    else if (resetForm.password !== resetForm.confirmPassword) errs.confirmPassword = 'Passwords do not match'

    if (Object.keys(errs).length > 0) {
      setResetErrors(errs)
      return
    }

    setResetLoading(true)
    try {
      await manageApi.bulkResetPassword(resetTargetIds, resetForm.password)
      await fetchAdmins()
      setShowResetModal(false)
      setSelected([])
      toast.success(`Password reset for ${resetTargetIds.length} admin(s)`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <Layout>
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-violet-100 text-violet-700">
              <IconShield />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
              Manage Admins
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure administrative permissions, invite portal managers, and control active status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAdmins}
            disabled={loading}
            aria-label="Refresh admins list"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-purple-200/80 bg-white/80 hover:bg-white text-slate-700 shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Spinner size="sm" /> : <IconRefresh />}
            <span className="hidden sm:inline">{loading ? 'Updating…' : 'Refresh'}</span>
          </button>

          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-md shadow-violet-600/20 transition-all hover:shadow-lg active:scale-95"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
          >
            <IconAdd />
            <span>Add Admin</span>
          </button>
        </div>
      </div>

      {/* ── Search, Filters, and Bulk Toolbar ────────────────────────────── */}
      <div className="mb-4 bg-white/90 backdrop-blur-md rounded-2xl border border-purple-100 p-3 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <IconSearch />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or phone…"
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-purple-100 bg-slate-50/70 focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none text-slate-800 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-2.5 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['All', 'Active', 'Inactive'].map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === tab
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {tab}
                <span className="ml-1.5 text-[10px] opacity-75 font-normal">
                  ({tab === 'All' ? admins.length : admins.filter(a => a.status === tab).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Action Toolbar */}
        {selCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-purple-100/70 animate-in fade-in duration-150">
            <span className="text-xs font-bold text-violet-800 bg-violet-100/80 px-2.5 py-1 rounded-lg">
              {selCount} selected
            </span>

            <button
              onClick={() => openEdit()}
              disabled={selCount !== 1}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                selCount === 1
                  ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-sm'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
            >
              <IconEdit /> Edit
            </button>

            <button
              onClick={() => openDelete([...selected])}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
            >
              <IconDelete /> Delete ({selCount})
            </button>

            <button
              onClick={handleToggleSelected}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                selectedAllActive
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {selectedAllActive ? <IconToggleOff /> : <IconToggleOn />}
              Set to {selectedAllActive ? 'Inactive' : 'Active'}
            </button>

            <button
              onClick={() => openReset([...selected])}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition-all"
            >
              <IconKey /> Reset Password
            </button>

            <button
              onClick={() => setSelected([])}
              className="ml-auto text-xs text-slate-400 hover:text-slate-600 font-medium px-2 py-1"
            >
              Clear selection
            </button>
          </div>
        )}
      </div>

      {apiError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between">
          <span>{apiError}</span>
          <button onClick={fetchAdmins} className="underline text-red-800 font-semibold">Retry</button>
        </div>
      )}

      {/* ── Mobile View: Cards ────────────────────────────────────────────── */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl border border-purple-100 p-2"><ListSkeleton count={4} /></div>
        ) : filteredAdmins.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-purple-100">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-purple-400">
              <IconShield />
            </div>
            <p className="text-sm font-semibold text-slate-800">No admins found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search or add a new admin.</p>
          </div>
        ) : (
          filteredAdmins.map(admin => {
            const isSelected = selected.includes(admin.id)
            return (
              <div
                key={admin.id}
                className={`bg-white rounded-2xl p-4 border transition-all duration-150 ${
                  isSelected
                    ? 'border-violet-500 shadow-md ring-2 ring-violet-500/10'
                    : 'border-purple-100/90 shadow-sm hover:border-purple-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(admin.id)}
                      className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 flex-shrink-0"
                    />
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)' }}>
                      {getInitials(admin.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 truncate">{admin.name}</span>
                        <StatusBadge status={admin.status} />
                      </div>
                      {admin.email && <p className="text-[11px] text-slate-400 truncate mt-0.5">{admin.email}</p>}
                      <p className="text-xs font-mono text-slate-500 mt-0.5">{admin.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Joined {fmtDate(admin.created_at)}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(admin.id)}
                      className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                      title="Edit"
                    >
                      <IconEdit />
                    </button>
                    <button
                      onClick={() => handleRowToggle(admin)}
                      className={`p-2 rounded-lg transition-colors ${admin.status === 'Active' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                      title={admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                    >
                      {admin.status === 'Active' ? <IconToggleOn /> : <IconToggleOff />}
                    </button>
                    <button
                      onClick={() => openReset([admin.id])}
                      className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                      title="Reset password"
                    >
                      <IconKey />
                    </button>
                    <button
                      onClick={() => openDelete([admin.id])}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <IconDelete />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Desktop View: High-Density Table ──────────────────────────────── */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-purple-100/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-purple-100/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={el => { if (el) el.indeterminate = someChecked && !allChecked }}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5">Admin User</th>
                <th className="px-4 py-3.5">Phone Number</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Date Registered</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {loading ? (
                <TableSkeletonRows count={6} columns={6} />
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No administrators found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map(admin => {
                  const isSelected = selected.includes(admin.id)
                  return (
                    <tr
                      key={admin.id}
                      onClick={() => toggleRow(admin.id)}
                      className={`cursor-pointer transition-colors duration-150 ${
                        isSelected ? 'bg-violet-50/70 hover:bg-violet-50' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(admin.id)}
                          className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] text-white flex-shrink-0 shadow-sm"
                            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}
                          >
                            {getInitials(admin.name)}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 text-sm block leading-tight truncate">{admin.name}</span>
                            <span className="text-[11px] text-slate-400 font-normal truncate block">{admin.email || '—'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-600 font-medium">
                        {admin.phone}
                      </td>

                      <td className="px-4 py-3.5">
                        <StatusBadge status={admin.status} />
                      </td>

                      <td className="px-4 py-3.5 text-slate-500">
                        {fmtDate(admin.created_at)}
                      </td>

                      <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEdit(admin.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit"
                          >
                            <IconEdit />
                          </button>
                          <button
                            onClick={() => handleRowToggle(admin)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              admin.status === 'Active'
                                ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={admin.status === 'Active' ? 'Set Inactive' : 'Set Active'}
                          >
                            {admin.status === 'Active' ? <IconToggleOn /> : <IconToggleOff />}
                          </button>
                          <button
                            onClick={() => openReset([admin.id])}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                            title="Reset password"
                          >
                            <IconKey />
                          </button>
                          <button
                            onClick={() => openDelete([admin.id])}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <IconDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Admin Modal ──────────────────────────────────────────────── */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <ModalPanel
            title="Create New Administrator"
            subtitle="Grant admin credentials to manage accounts and portals."
            onClose={() => setShowAddModal(false)}
          >
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Abebe Kebede"
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all ${
                    addErrors.name
                      ? 'border-red-400 ring-2 ring-red-100'
                      : 'border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100'
                  }`}
                />
                {addErrors.name && <p className="text-xs text-red-500 font-medium mt-1">{addErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Mobile Number
                </label>
                <PhoneInput
                  value={addForm.phone}
                  onChange={v => setAddForm(f => ({ ...f, phone: v }))}
                  error={addErrors.phone}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className={`flex items-center border rounded-xl overflow-hidden transition-all bg-white ${
                  addErrors.email
                    ? 'border-red-400 ring-2 ring-red-100'
                    : addForm.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email.trim())
                      ? 'border-emerald-400 ring-2 ring-emerald-100'
                      : 'border-slate-200 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100'
                }`}>
                  <span className="pl-3.5 text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={e => {
                      setAddForm(f => ({ ...f, email: e.target.value }))
                      if (addErrors.email) setAddErrors(ev => ({ ...ev, email: undefined }))
                    }}
                    onBlur={e => {
                      const v = e.target.value.trim()
                      if (!v) setAddErrors(ev => ({ ...ev, email: 'Email address is required' }))
                      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) setAddErrors(ev => ({ ...ev, email: 'Enter a valid email address (e.g. admin@shmeta.com)' }))
                    }}
                    placeholder="e.g. admin@shmeta.com"
                    className="w-full px-3 py-2.5 text-sm outline-none bg-transparent text-slate-800 placeholder-slate-400"
                  />
                  {addForm.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email.trim()) && (
                    <span className="pr-3 text-emerald-500">✓</span>
                  )}
                </div>
                {addErrors.email
                  ? <p className="text-xs text-red-500 font-medium mt-1">{addErrors.email}</p>
                  : <p className="text-[11px] text-slate-400 mt-1">Required — used for password recovery</p>
                }
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Initial Password
                </label>
                <PasswordInput
                  value={addForm.password}
                  onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
                  show={showAddPwd}
                  onToggle={() => setShowAddPwd(v => !v)}
                  error={addErrors.password}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Confirm Password
                </label>
                <PasswordInput
                  value={addForm.confirmPassword}
                  onChange={e => setAddForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  show={showAddConfirm}
                  onToggle={() => setShowAddConfirm(v => !v)}
                  error={addErrors.confirmPassword}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-purple-100/70 bg-slate-50/50 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                disabled={addLoading}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={addLoading}
                className="flex-1 py-2.5 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-600/20 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
              >
                {addLoading ? <><Spinner size="sm" className="border-white/30 border-t-white" /> Creating…</> : 'Confirm & Create'}
              </button>
            </div>
          </ModalPanel>
        </Modal>
      )}

      {/* ── Edit Admin Modal ─────────────────────────────────────────────── */}
      {showEditModal && (
        <Modal onClose={() => setShowEditModal(false)}>
          <ModalPanel
            title="Edit Admin Account"
            subtitle="Update display name, contact phone, and email address."
            onClose={() => setShowEditModal(false)}
          >
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all ${
                    editErrors.name
                      ? 'border-red-400 ring-2 ring-red-100'
                      : 'border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100'
                  }`}
                />
                {editErrors.name && <p className="text-xs text-red-500 font-medium mt-1">{editErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Mobile Number
                </label>
                <PhoneInput
                  value={editForm.phone}
                  onChange={v => setEditForm(f => ({ ...f, phone: v }))}
                  error={editErrors.phone}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className={`flex items-center border rounded-xl overflow-hidden transition-all bg-white ${
                  editErrors.email
                    ? 'border-red-400 ring-2 ring-red-100'
                    : editForm.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())
                      ? 'border-emerald-400 ring-2 ring-emerald-100'
                      : 'border-slate-200 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100'
                }`}>
                  <span className="pl-3.5 text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={e => {
                      setEditForm(f => ({ ...f, email: e.target.value }))
                      if (editErrors.email) setEditErrors(ev => ({ ...ev, email: undefined }))
                    }}
                    onBlur={e => {
                      const v = e.target.value.trim()
                      if (!v) setEditErrors(ev => ({ ...ev, email: 'Email address is required' }))
                      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) setEditErrors(ev => ({ ...ev, email: 'Enter a valid email address (e.g. admin@shmeta.com)' }))
                    }}
                    placeholder="e.g. admin@shmeta.com"
                    className="w-full px-3 py-2.5 text-sm outline-none bg-transparent text-slate-800 placeholder-slate-400"
                  />
                  {editForm.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim()) && (
                    <span className="pr-3 text-emerald-500">✓</span>
                  )}
                </div>
                {editErrors.email
                  ? <p className="text-xs text-red-500 font-medium mt-1">{editErrors.email}</p>
                  : <p className="text-[11px] text-slate-400 mt-1">Required — used for password recovery</p>
                }
              </div>
            </div>

            <div className="px-6 py-4 border-t border-purple-100/70 bg-slate-50/50 flex gap-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEdit}
                disabled={editLoading}
                className="flex-1 py-2.5 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-600/20 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
              >
                {editLoading ? <><Spinner size="sm" className="border-white/30 border-t-white" /> Saving…</> : 'Save Changes'}
              </button>
            </div>
          </ModalPanel>
        </Modal>
      )}

      {/* ── Reset Password Modal ─────────────────────────────────────────── */}
      {showResetModal && (
        <Modal onClose={() => setShowResetModal(false)}>
          <ModalPanel
            title={`Reset Password (${resetTargetIds.length} User${resetTargetIds.length > 1 ? 's' : ''})`}
            subtitle="Enter and confirm a temporary or new password."
            onClose={() => setShowResetModal(false)}
          >
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  New Password
                </label>
                <PasswordInput
                  value={resetForm.password}
                  onChange={e => setResetForm(f => ({ ...f, password: e.target.value }))}
                  show={showResetPwd}
                  onToggle={() => setShowResetPwd(v => !v)}
                  error={resetErrors.password}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Confirm New Password
                </label>
                <PasswordInput
                  value={resetForm.confirmPassword}
                  onChange={e => setResetForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  show={showResetConfirm}
                  onToggle={() => setShowResetConfirm(v => !v)}
                  error={resetErrors.confirmPassword}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-purple-100/70 bg-slate-50/50 flex gap-3">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={resetLoading}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetSave}
                disabled={resetLoading}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {resetLoading ? <><Spinner size="sm" className="border-white/30 border-t-white" /> Updating…</> : 'Update Password'}
              </button>
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
