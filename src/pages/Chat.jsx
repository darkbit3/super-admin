import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react'
import Layout from '../components/Layout'
import { api } from '../api/client'
import { ListSkeleton, MessageSkeleton, Spinner } from '../components/Loaders'

const palette = ['#7C3AED', '#6366F1', '#10B981', '#0EA5E9', '#F59E0B', '#EC4899', '#8B5CF6']

const GROUP_COLORS = {
  'group-cherk':    '#7C3AED',
  'group-general':  '#10B981',
  'group-business': '#0EA5E9',
  'group-support':  '#F59E0B',
}

function formatTime(value) {
  if (!value) return 'Now'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(d)
}

function initials(name) {
  return (name || 'U').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || 'U'
}

// ── Shared UI ────────────────────────────────────────────────────────────────

function Avatar({ name, color, size = 40 }) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-white flex-shrink-0 shadow-sm select-none"
      style={{ width: size, height: size, backgroundColor: color || '#7C3AED', fontSize: size < 36 ? 11 : 13 }}
    >
      {initials(name)}
    </div>
  )
}

function RoleBadge({ role }) {
  const roleMap = {
    Admin:        'bg-violet-50 text-violet-700 border-violet-200/80',
    Manufacturer: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    Reseller:     'bg-blue-50 text-blue-700 border-blue-200/80',
    Cashier:      'bg-amber-50 text-amber-700 border-amber-200/80',
    Cutter:       'bg-purple-50 text-purple-700 border-purple-200/80',
  }
  const cls = roleMap[role] || 'bg-slate-100 text-slate-700 border-slate-200'
  return (
    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {role}
    </span>
  )
}

// ── Add Category Modal ───────────────────────────────────────────────────────

function AddCategoryModal({ groupId, groupName, onClose, onCreated }) {
  const [name, setName]       = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Category name is required'); return }
    try {
      setSubmitting(true)
      setError('')
      const res = await api.post(`/chat/groups/${groupId}/categories`, {
        name: name.trim(),
        image_url: imageUrl.trim() || null,
      })
      onCreated?.(res?.data || null)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create category')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-white border border-purple-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-100 bg-gradient-to-r from-purple-50/70 to-white">
          <div>
            <h3 className="text-base font-bold text-slate-900">Add Category</h3>
            <p className="text-xs text-slate-500 mt-0.5">For <span className="font-semibold text-violet-700">{groupName}</span></p>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">✕</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. For Men, For Girl, For Kid"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Image URL <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-slate-800"
            />
            {imageUrl.trim() && (
              <div className="mt-2">
                <img
                  src={imageUrl}
                  alt="preview"
                  className="h-20 w-20 object-cover rounded-xl border border-slate-200"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-purple-100 px-6 py-3.5 bg-slate-50/60">
          <button type="button" onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={submitting}
            className="rounded-xl px-5 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/20 disabled:opacity-60 transition-all"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}>
            {submitting ? 'Adding…' : 'Add Category'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── PersonRow ────────────────────────────────────────────────────────────────
const PersonRow = memo(function PersonRow({ person, colorIdx, isSelected, unreadCount, onSelect }) {
  const color = palette[colorIdx % palette.length]
  return (
    <button type="button" onClick={() => onSelect(person.id)}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-all border-b border-purple-50 ${
        isSelected ? 'bg-violet-50/90 border-l-4 border-l-violet-600' : 'hover:bg-slate-50/70 border-l-4 border-l-transparent'
      }`}>
      <div className="relative">
        <Avatar name={person.name} color={color} />
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${person.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-900 mb-0.5">{person.name}</p>
        <RoleBadge role={person.role} />
      </div>
      {unreadCount > 0 && (
        <span className="inline-flex min-w-[20px] h-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white bg-red-500 shadow-sm">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
})

// ── GroupRow ─────────────────────────────────────────────────────────────────
const GroupRow = memo(function GroupRow({ group, isSelected, unreadCount, onSelect }) {
  const color = GROUP_COLORS[group.id] || '#7C3AED'
  return (
    <button type="button" onClick={() => onSelect(group.id)}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-all border-b border-purple-50 ${
        isSelected ? 'bg-violet-50/90 border-l-4 border-l-violet-600' : 'hover:bg-slate-50/70 border-l-4 border-l-transparent'
      }`}>
      <Avatar name={group.name} color={color} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-900 mb-0.5">{group.name}</p>
        <p className="text-[10px] truncate text-slate-400">
          {group.categories?.length > 0
            ? `${group.categories.length} categor${group.categories.length === 1 ? 'y' : 'ies'}`
            : group.description || `${group.memberCount || 0} members`}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        {unreadCount > 0 && (
          <span className="inline-flex min-w-[20px] h-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white bg-red-500">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 text-violet-700">
          {group.memberCount || 0}
        </span>
      </div>
    </button>
  )
})

// ── Group Header with Categories panel ───────────────────────────────────────
function GroupCategoriesPanel({ group, onCategoryAdded, onCategoryDeleted }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [deletingId, setDeletingId]     = useState(null)

  const handleDelete = async (catId) => {
    if (!window.confirm('Delete this category?')) return
    try {
      setDeletingId(catId)
      await api.delete(`/chat/groups/${group.id}/categories/${catId}`)
      onCategoryDeleted?.(catId)
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete category')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="border-b border-purple-100 bg-slate-50/60 px-5 py-3 flex-shrink-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700">Categories</span>
        <button type="button" onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-violet-700 bg-violet-100/70 hover:bg-violet-100 rounded-lg transition-colors">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>
      </div>

      {group.categories?.length === 0 ? (
        <p className="text-[11px] text-slate-400 italic">No categories yet. Add one above.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {group.categories.map((cat) => (
            <div key={cat.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-purple-100 shadow-sm">
              {cat.image_url && (
                <img src={cat.image_url} alt={cat.name}
                  className="w-4 h-4 rounded-full object-cover"
                  onError={(e) => { e.target.style.display = 'none' }} />
              )}
              <span className="text-[11px] font-semibold text-slate-700">{cat.name}</span>
              <button type="button" onClick={() => handleDelete(cat.id)}
                disabled={deletingId === cat.id}
                className="ml-0.5 text-slate-300 hover:text-red-500 transition-colors text-xs leading-none disabled:opacity-40">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddCategoryModal
          groupId={group.id}
          groupName={group.name}
          onClose={() => setShowAddModal(false)}
          onCreated={onCategoryAdded}
        />
      )}
    </div>
  )
}

// ── ConversationPanel ────────────────────────────────────────────────────────
const ConversationPanel = memo(function ConversationPanel({
  selectedPerson,
  selectedGroup,
  messages,
  groupMessages,
  loadingMessages,
  loadingGroupMessages,
  sending,
  onSend,
  onSendGroup,
  onBack,
  onCategoryAdded,
  onCategoryDeleted,
  messagesEndRef,
}) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { setDraft('') }, [selectedPerson?.id, selectedGroup?.id])
  useEffect(() => { if (!sending) inputRef.current?.focus() }, [sending])

  const activeMessages    = selectedGroup ? groupMessages : messages
  const activeThreadName  = selectedGroup ? selectedGroup.name : selectedPerson?.name || 'Chat'
  const activeThreadColor = selectedGroup ? (GROUP_COLORS[selectedGroup.id] || '#7C3AED') : palette[0]
  const isLoading         = selectedGroup ? loadingGroupMessages : loadingMessages

  const handleSend = () => {
    const text = draft.trim()
    if (!text || sending) return
    setDraft('')
    if (selectedGroup) onSendGroup(text)
    else onSend(text)
  }

  if (!selectedPerson && !selectedGroup) {
    return (
      <section className="flex flex-col items-center justify-center h-full gap-4 py-24 text-center flex-1 bg-white">
        <div className="w-16 h-16 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        </div>
        <div>
          <p className="text-base font-bold text-slate-800">Direct Messaging Channel</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">Select a contact or group on the left to start messaging.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col min-h-0 flex-1 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-100 px-5 py-3.5 flex-shrink-0 bg-slate-50/60">
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={onBack}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg mr-1 bg-violet-100 text-violet-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <Avatar name={activeThreadName} color={activeThreadColor} size={40} />
          <div className="min-w-0">
            <p className="font-bold text-sm text-slate-900 leading-tight truncate">{activeThreadName}</p>
            {selectedGroup ? (
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                <span className="px-2 rounded-full bg-violet-100 text-violet-700 font-semibold text-[10px]">Fixed Group</span>
                <span>{selectedGroup.memberCount || 0} members</span>
              </div>
            ) : (
              <div className="mt-0.5"><RoleBadge role={selectedPerson?.role} /></div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${selectedGroup || selectedPerson?.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
            {selectedGroup ? 'Group Conversation' : (selectedPerson?.status || 'Active')}
          </span>
        </div>
      </div>

      {/* Category bar (groups only) */}
      {selectedGroup && (
        <GroupCategoriesPanel
          group={selectedGroup}
          onCategoryAdded={onCategoryAdded}
          onCategoryDeleted={onCategoryDeleted}
        />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0 bg-gradient-to-b from-purple-50/20 to-white">
        {isLoading ? <MessageSkeleton /> : activeMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">No messages yet</p>
              <p className="text-xs text-slate-500 mt-1">Send a message below to begin this conversation.</p>
            </div>
          </div>
        ) : (
          activeMessages.map((msg) => {
            const isMe = msg.sender === 'me'
            return (
              <div key={msg.id} className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && <Avatar name={msg.senderName || activeThreadName} color={activeThreadColor} size={28} />}
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                  isMe ? 'bg-violet-600 text-white rounded-br-xs' : 'bg-slate-100/90 text-slate-800 rounded-bl-xs border border-purple-50'
                }`}>
                  {!isMe && selectedGroup && (
                    <p className="mb-1 text-[10px] font-bold text-violet-700">{msg.senderName || 'Member'}</p>
                  )}
                  <p className="leading-relaxed break-words text-sm">{msg.text}</p>
                  <div className="mt-1.5 flex items-center justify-between gap-3 text-[10px] opacity-75">
                    <span>{msg.time}</span>
                    {isMe && <span className="font-bold">{msg.status === 'read' ? '✓✓' : '✓'}</span>}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-purple-100 p-3.5 flex-shrink-0 bg-white">
        <div className="flex items-center gap-2 rounded-2xl px-3 py-2 border border-purple-100 bg-slate-50/70 focus-within:bg-white focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder={selectedGroup ? `Message ${selectedGroup.name}…` : `Message ${selectedPerson?.name || 'user'}…`}
            className="flex-1 bg-transparent text-xs sm:text-sm outline-none resize-none leading-relaxed text-slate-800 max-h-24"
          />
          <button type="button" onClick={handleSend} disabled={!draft.trim() || sending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm disabled:opacity-40 transition-all flex-shrink-0 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}>
            {sending ? <Spinner size="sm" className="border-white/30 border-t-white" /> : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
            <span>Send</span>
          </button>
        </div>
        <p className="mt-1 text-[10px] text-right text-slate-400">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </section>
  )
})

// ── ContactsSidebar ──────────────────────────────────────────────────────────
const ContactsSidebar = memo(function ContactsSidebar({
  groups, adminContacts, userContacts,
  loadingPeople, loadingGroups,
  selectedPersonId, selectedGroupId, unreadMap,
  onSelectPerson, onSelectGroup,
  search, setSearch,
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3.5 border-b border-purple-100 bg-slate-50/50 space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Conversations</h2>
        </div>
        <div className="relative">
          <span className="absolute inset-y-0 left-2.5 flex items-center text-slate-400 pointer-events-none">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts…"
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-purple-100 bg-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 text-slate-800" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute inset-y-0 right-2 flex items-center text-xs text-slate-400 hover:text-slate-600">✕</button>
          )}
        </div>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto divide-y divide-purple-50">
        {/* Fixed groups section */}
        {loadingGroups ? (
          <div className="p-2"><ListSkeleton count={4} /></div>
        ) : groups.length > 0 && (
          <div>
            <div className="px-4 pt-3 pb-1 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700">Groups</span>
              <span className="text-[10px] font-semibold px-1.5 rounded-full bg-violet-100 text-violet-800">{groups.length}</span>
            </div>
            {groups.map((g) => (
              <GroupRow key={g.id} group={g}
                isSelected={g.id === selectedGroupId}
                unreadCount={unreadMap[g.id] || 0}
                onSelect={onSelectGroup} />
            ))}
          </div>
        )}

        {/* People */}
        {loadingPeople ? (
          <div className="p-2"><ListSkeleton count={5} /></div>
        ) : (adminContacts.length === 0 && userContacts.length === 0) ? (
          <div className="p-8 text-center text-xs text-slate-400">No contacts found</div>
        ) : (
          <>
            {adminContacts.length > 0 && (
              <div>
                <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700">Admins</span>
                  <span className="text-[10px] font-semibold px-1.5 rounded-full bg-violet-100 text-violet-800">{adminContacts.length}</span>
                </div>
                {adminContacts.map((p, idx) => (
                  <PersonRow key={p.id} person={p} colorIdx={idx}
                    isSelected={p.id === selectedPersonId}
                    unreadCount={unreadMap[p.id] || 0}
                    onSelect={onSelectPerson} />
                ))}
              </div>
            )}
            {userContacts.length > 0 && (
              <div>
                <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Users</span>
                  <span className="text-[10px] font-semibold px-1.5 rounded-full bg-slate-100 text-slate-700">{userContacts.length}</span>
                </div>
                {userContacts.map((p, idx) => (
                  <PersonRow key={p.id} person={p} colorIdx={idx + adminContacts.length}
                    isSelected={p.id === selectedPersonId}
                    unreadCount={unreadMap[p.id] || 0}
                    onSelect={onSelectPerson} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
})

// ── Main Chat component ──────────────────────────────────────────────────────
export default function Chat() {
  const [people,               setPeople]               = useState([])
  const [groups,               setGroups]               = useState([])
  const [search,               setSearch]               = useState('')
  const [selectedPersonId,     setSelectedPersonId]     = useState('')
  const [selectedGroupId,      setSelectedGroupId]      = useState('')
  const [messages,             setMessages]             = useState([])
  const [groupMessages,        setGroupMessages]        = useState([])
  const [loadingPeople,        setLoadingPeople]        = useState(true)
  const [loadingGroups,        setLoadingGroups]        = useState(true)
  const [loadingMessages,      setLoadingMessages]      = useState(false)
  const [loadingGroupMessages, setLoadingGroupMessages] = useState(false)
  const [sending,              setSending]              = useState(false)
  const [mobileShowChat,       setMobileShowChat]       = useState(false)
  const [unreadMap,            setUnreadMap]            = useState({})
  const messagesEndRef = useRef(null)

  // ── Data fetching ──────────────────────────────────────────────────────
  const fetchPeople = useCallback(async (query = '') => {
    try {
      setLoadingPeople(true)
      const res  = await api.get(`/chat/people${query ? `?search=${encodeURIComponent(query)}` : ''}`)
      const list = res?.data || []
      setPeople(list)
      if (!selectedPersonId && !selectedGroupId && list[0]) setSelectedPersonId(list[0].id)
    } catch (err) {
      console.error('Failed to load contacts', err)
      setPeople([])
    } finally {
      setLoadingPeople(false)
    }
  }, []) // eslint-disable-line

  const fetchGroups = useCallback(async () => {
    try {
      setLoadingGroups(true)
      const res = await api.get('/chat/groups')
      setGroups(res?.data || [])
    } catch (err) {
      console.error('Failed to load groups', err)
      setGroups([])
    } finally {
      setLoadingGroups(false)
    }
  }, [])

  useEffect(() => { fetchPeople(search) }, [search]) // eslint-disable-line
  useEffect(() => { fetchGroups() },       [])       // eslint-disable-line

  const loadMessages = useCallback(async (personId) => {
    if (!personId) return
    try {
      setLoadingMessages(true)
      const res  = await api.get(`/chat/messages/${personId}`)
      const msgs = (res?.data || []).map((m) => ({
        id: m.id, sender: m.isMine ? 'me' : 'them',
        text: m.message, time: formatTime(m.createdAt), status: m.status || 'sent',
      }))
      setMessages(msgs)
    } catch (err) {
      console.error('Failed to load messages', err)
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  const loadGroupMessages = useCallback(async (groupId) => {
    if (!groupId) return
    try {
      setLoadingGroupMessages(true)
      const res  = await api.get(`/chat/groups/${groupId}/messages`)
      const msgs = (res?.data || []).map((m) => ({
        id: m.id, sender: m.isMine ? 'me' : 'them',
        text: m.message, time: formatTime(m.createdAt),
        senderName: m.senderRole === 'super_admin' ? 'Super Admin' : m.senderRole,
        status: m.status || 'sent',
      }))
      setGroupMessages(msgs)
    } catch (err) {
      console.error('Failed to load group messages', err)
      setGroupMessages([])
    } finally {
      setLoadingGroupMessages(false)
    }
  }, [])

  useEffect(() => {
    if (selectedGroupId)  { loadGroupMessages(selectedGroupId); return }
    if (selectedPersonId) { loadMessages(selectedPersonId) }
  }, [selectedGroupId, selectedPersonId]) // eslint-disable-line

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, groupMessages])

  useEffect(() => {
    if (!selectedPersonId || selectedGroupId) return
    const id = setInterval(() => loadMessages(selectedPersonId), 60000)
    return () => clearInterval(id)
  }, [selectedPersonId, selectedGroupId]) // eslint-disable-line

  useEffect(() => {
    if (!selectedGroupId) return
    const id = setInterval(() => loadGroupMessages(selectedGroupId), 60000)
    return () => clearInterval(id)
  }, [selectedGroupId]) // eslint-disable-line

  useEffect(() => {
    const id = setInterval(() => {
      fetchGroups()
      if (selectedGroupId) loadGroupMessages(selectedGroupId)
    }, 30000)
    return () => clearInterval(id)
  }, [selectedGroupId]) // eslint-disable-line

  // ── Derived ────────────────────────────────────────────────────────────
  const filteredPeople = useMemo(() => {
    if (!search) return people
    const q = search.toLowerCase()
    return people.filter((p) => `${p.name || ''} ${p.role || ''}`.toLowerCase().includes(q))
  }, [people, search])

  const adminContacts  = useMemo(() => filteredPeople.filter((p) => p.role === 'Admin'),  [filteredPeople])
  const userContacts   = useMemo(() => filteredPeople.filter((p) => p.role !== 'Admin'),  [filteredPeople])
  const selectedPerson = useMemo(() => people.find((p) => p.id === selectedPersonId) || null, [people, selectedPersonId])
  const selectedGroup  = useMemo(() => groups.find((g) => g.id === selectedGroupId)  || null, [groups, selectedGroupId])

  // ── Actions ────────────────────────────────────────────────────────────
  const selectPerson = useCallback((id) => {
    setSelectedPersonId(id)
    setSelectedGroupId('')
    setUnreadMap((prev) => ({ ...prev, [id]: 0 }))
    setMobileShowChat(true)
  }, [])

  const selectGroup = useCallback((id) => {
    setSelectedGroupId(id)
    setSelectedPersonId('')
    setUnreadMap((prev) => ({ ...prev, [id]: 0 }))
    setMobileShowChat(true)
  }, [])

  const sendMessage = useCallback(async (text) => {
    if (!selectedPerson || !text || sending) return
    setSending(true)
    setMessages((prev) => [...prev, { id: `tmp-${Date.now()}`, sender: 'me', text, time: formatTime(new Date().toISOString()) }])
    try {
      await api.post('/chat/send', {
        receiverId:   selectedPerson.id,
        receiverRole: selectedPerson.role === 'Admin' ? 'admin' : 'user',
        message:      text,
      })
      await loadMessages(selectedPerson.id)
    } catch (err) {
      console.error('Failed to send message', err)
    } finally {
      setSending(false)
    }
  }, [selectedPerson, sending, loadMessages])

  const sendGroupMessage = useCallback(async (text) => {
    if (!selectedGroupId || !text || sending) return
    setSending(true)
    setGroupMessages((prev) => [...prev, { id: `tmp-${Date.now()}`, sender: 'me', text, time: formatTime(new Date().toISOString()), senderName: 'Super Admin' }])
    try {
      await api.post(`/chat/groups/${selectedGroupId}/send`, { message: text })
      await loadGroupMessages(selectedGroupId)
    } catch (err) {
      console.error('Failed to send group message', err)
    } finally {
      setSending(false)
    }
  }, [selectedGroupId, sending, loadGroupMessages])

  const handleBack = useCallback(() => setMobileShowChat(false), [])

  // Refresh a single group's categories after add/delete
  const handleCategoryAdded = useCallback((newCat) => {
    if (!newCat) return
    setGroups((prev) => prev.map((g) =>
      g.id === selectedGroupId
        ? { ...g, categories: [...(g.categories || []), newCat] }
        : g
    ))
  }, [selectedGroupId])

  const handleCategoryDeleted = useCallback((catId) => {
    setGroups((prev) => prev.map((g) =>
      g.id === selectedGroupId
        ? { ...g, categories: (g.categories || []).filter((c) => c.id !== catId) }
        : g
    ))
  }, [selectedGroupId])

  // ── Shared props ───────────────────────────────────────────────────────
  const sidebarProps = {
    groups, adminContacts, userContacts,
    loadingPeople, loadingGroups,
    selectedPersonId, selectedGroupId, unreadMap,
    onSelectPerson: selectPerson,
    onSelectGroup:  selectGroup,
    search, setSearch,
  }

  const convoProps = {
    selectedPerson, selectedGroup,
    messages, groupMessages,
    loadingMessages, loadingGroupMessages,
    sending,
    onSend:              sendMessage,
    onSendGroup:         sendGroupMessage,
    onBack:              handleBack,
    onCategoryAdded:     handleCategoryAdded,
    onCategoryDeleted:   handleCategoryDeleted,
    messagesEndRef,
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-violet-100 text-violet-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Portal Chat</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            4 fixed groups — all members auto-included. Manage categories per group.
          </p>
        </div>
      </div>

      {/* Chat container */}
      <div className="rounded-2xl border border-purple-100/90 shadow-sm overflow-hidden bg-white">
        {/* Mobile */}
        <div className="lg:hidden flex flex-col h-[650px]">
          {!mobileShowChat ? (
            <aside className="flex-1 overflow-hidden bg-slate-50/40">
              <ContactsSidebar {...sidebarProps} />
            </aside>
          ) : (
            <ConversationPanel {...convoProps} />
          )}
        </div>
        {/* Desktop */}
        <div className="hidden lg:grid lg:grid-cols-[320px_minmax(0,1fr)] h-[700px]">
          <aside className="border-r border-purple-100 overflow-hidden bg-slate-50/40">
            <ContactsSidebar {...sidebarProps} />
          </aside>
          <ConversationPanel {...convoProps} />
        </div>
      </div>
    </Layout>
  )
}
