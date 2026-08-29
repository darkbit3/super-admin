import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Layout from '../components/Layout'
import { api } from '../api/client'

const ACCENT = '#7C3AED'
const ACCENT_LIGHT = 'rgba(124,58,237,0.10)'
const ACCENT_BORDER = 'rgba(124,58,237,0.20)'
const DARK = '#1A0A2E'
const TEXT_MID = '#5B4B68'
const PANEL_BG = '#F7F3FF'
const CHAT_BG = '#FFFCFF'
const palette = [ACCENT, '#8B5CF6', '#10B981', '#64748B', '#F97316', '#3B82F6', '#EF4444']

function formatTime(value) {
  if (!value) return 'Now'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(d)
}

function initials(name) {
  return (name || 'U').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || 'U'
}

function Avatar({ name, color, size = 44 }) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-semibold text-white flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: color || ACCENT, fontSize: size < 36 ? 10 : 12 }}
    >
      {initials(name)}
    </div>
  )
}

function RoleBadge({ role }) {
  const roleMap = {
    Admin: { bg: ACCENT_LIGHT, text: ACCENT, border: ACCENT_BORDER },
    Manufacturer: { bg: 'rgba(16,185,129,0.10)', text: '#047857', border: 'rgba(16,185,129,0.25)' },
    Reseller: { bg: 'rgba(59,130,246,0.10)', text: '#1d4ed8', border: 'rgba(59,130,246,0.25)' },
    Cashier: { bg: 'rgba(245,158,11,0.10)', text: '#b45309', border: 'rgba(245,158,11,0.25)' },
    Cutter: { bg: 'rgba(168,85,247,0.10)', text: '#7e22ce', border: 'rgba(168,85,247,0.25)' },
  }
  const c = roleMap[role] || { bg: ACCENT_LIGHT, text: TEXT_MID, border: ACCENT_BORDER }
  return (
    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {role}
    </span>
  )
}

function CreateGroupModal({ people, onClose, onCreate }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedMemberIds, setSelectedMemberIds] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const selectablePeople = (people || []).filter((person) => !person.isSuperAdmin && person.id)

  const toggleMember = (personId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(personId) ? prev.filter((id) => id !== personId) : [...prev, personId]
    )
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Group name is required')
      return
    }
    if (selectedMemberIds.length === 0) {
      alert('Select at least one member for the group')
      return
    }

    try {
      setSubmitting(true)
      const res = await api.post('/chat/groups', {
        name: name.trim(),
        description: description.trim(),
        memberIds: selectedMemberIds,
      })
      onCreate?.(res?.data || null)
      onClose()
    } catch (err) {
      console.error('Failed to create group', err)
      alert(err?.message || 'Unable to create the group right now.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }} onClick={(e) => {
      if (e.target === e.currentTarget) onClose()
    }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: '#fff', border: `1px solid ${ACCENT_BORDER}` }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: ACCENT_BORDER, backgroundColor: PANEL_BG }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: ACCENT_LIGHT }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={ACCENT} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: DARK }}>Create Group</h3>
              <p className="text-xs" style={{ color: TEXT_MID }}>Save the group and members to the database</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full transition-colors" style={{ color: TEXT_MID }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ACCENT_LIGHT }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: TEXT_MID }}>Group name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none" style={{ borderColor: ACCENT_BORDER, color: DARK }} placeholder="e.g. Sales Team" />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: TEXT_MID }}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none resize-none" style={{ borderColor: ACCENT_BORDER, color: DARK }} placeholder="Optional description for this group" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: TEXT_MID }}>Members</label>
              <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: ACCENT_LIGHT, color: ACCENT }}>{selectedMemberIds.length} selected</span>
            </div>

            <div className="rounded-xl border max-h-64 overflow-y-auto p-2" style={{ borderColor: ACCENT_BORDER, backgroundColor: '#F9F5FF' }}>
              {selectablePeople.length === 0 ? (
                <p className="text-sm py-4 text-center" style={{ color: TEXT_MID }}>No contacts available to add.</p>
              ) : (
                selectablePeople.map((person) => {
                  const isSelected = selectedMemberIds.includes(person.id)
                  return (
                    <button key={person.id} type="button" onClick={() => toggleMember(person.id)} className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors" style={{ backgroundColor: isSelected ? ACCENT_LIGHT : 'transparent' }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={person.name} color={palette[(person.id || '').length % palette.length]} size={34} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold" style={{ color: DARK }}>{person.name}</p>
                          <p className="text-[11px]" style={{ color: TEXT_MID }}>{person.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border" style={{ borderColor: isSelected ? ACCENT : ACCENT_BORDER, backgroundColor: isSelected ? ACCENT : 'transparent' }}>
                        {isSelected && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 3" /></svg>}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4" style={{ borderColor: ACCENT_BORDER, backgroundColor: PANEL_BG }}>
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold" style={{ color: TEXT_MID }}>Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={submitting} className="rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60" style={{ backgroundColor: ACCENT, color: '#fff' }}>{submitting ? 'Saving...' : 'Create Group'}</button>
        </div>
      </div>
    </div>
  )
}

export default function Chat() {
  const [people, setPeople] = useState([])
  const [groups, setGroups] = useState([])
  const [search, setSearch] = useState('')
  const [selectedPersonId, setSelectedPersonId] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [messages, setMessages] = useState([])
  const [groupMessages, setGroupMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loadingPeople, setLoadingPeople] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [loadingGroupMessages, setLoadingGroupMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [mobileShowChat, setMobileShowChat] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const fetchPeople = useCallback(async (query = '') => {
    try {
      setLoadingPeople(true)
      const res = await api.get(`/chat/people${query ? `?search=${encodeURIComponent(query)}` : ''}`)
      const list = res?.data || []
      setPeople(list)
      if (!selectedPersonId && !selectedGroupId && list[0]) setSelectedPersonId(list[0].id)
    } catch (err) {
      console.error('Failed to load contacts', err)
      setPeople([])
    } finally {
      setLoadingPeople(false)
    }
  }, [selectedGroupId, selectedPersonId])

  const fetchGroups = useCallback(async () => {
    try {
      const res = await api.get('/chat/groups')
      setGroups(res?.data || [])
    } catch (err) {
      console.error('Failed to load groups', err)
      setGroups([])
    }
  }, [])

  useEffect(() => {
    fetchPeople(search)
  }, [fetchPeople, search])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const loadMessages = useCallback(async (personId) => {
    if (!personId) return
    try {
      setLoadingMessages(true)
      const res = await api.get(`/chat/messages/${personId}`)
      setMessages((res?.data || []).map((m) => ({
        id: m.id,
        sender: m.isMine ? 'me' : 'them',
        text: m.message,
        time: formatTime(m.createdAt),
      })))
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
      const res = await api.get(`/chat/groups/${groupId}/messages`)
      setGroupMessages((res?.data || []).map((m) => ({
        id: m.id,
        sender: m.isMine ? 'me' : 'them',
        text: m.message,
        time: formatTime(m.createdAt),
        senderName: m.senderRole === 'super_admin' ? 'Super Admin' : m.senderRole,
      })))
    } catch (err) {
      console.error('Failed to load group messages', err)
      setGroupMessages([])
    } finally {
      setLoadingGroupMessages(false)
    }
  }, [])

  useEffect(() => {
    if (selectedGroupId) {
      loadGroupMessages(selectedGroupId)
    } else if (selectedPersonId) {
      loadMessages(selectedPersonId)
    }
  }, [selectedGroupId, selectedPersonId, loadGroupMessages, loadMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, groupMessages])

  useEffect(() => {
    if (!selectedPersonId || selectedGroupId) return
    const id = setInterval(() => loadMessages(selectedPersonId), 30000)
    return () => clearInterval(id)
  }, [selectedPersonId, selectedGroupId, loadMessages])

  useEffect(() => {
    if (!selectedGroupId) return
    const id = setInterval(() => loadGroupMessages(selectedGroupId), 30000)
    return () => clearInterval(id)
  }, [selectedGroupId, loadGroupMessages])

  const filteredPeople = useMemo(() => {
    if (!search) return people
    const q = search.toLowerCase()
    return people.filter((p) => `${p.name || ''} ${p.role || ''}`.toLowerCase().includes(q))
  }, [people, search])

  const adminContacts = filteredPeople.filter((p) => p.role === 'Admin')
  const userContacts = filteredPeople.filter((p) => p.role !== 'Admin')
  const selectedPerson = people.find((p) => p.id === selectedPersonId) || null
  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null

  const sendMessage = async () => {
    if (!selectedPerson || !draft.trim() || sending) return
    const text = draft.trim()
    setDraft('')
    setSending(true)
    setMessages((prev) => [...prev, { id: `tmp-${Date.now()}`, sender: 'me', text, time: formatTime(new Date().toISOString()) }])
    try {
      await api.post('/chat/send', {
        receiverId: selectedPerson.id,
        receiverRole: selectedPerson.role === 'Admin' ? 'admin' : 'user',
        message: text,
      })
      await loadMessages(selectedPerson.id)
    } catch (err) {
      console.error('Failed to send message', err)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const sendGroupMessage = async () => {
    if (!selectedGroupId || !draft.trim() || sending) return
    const text = draft.trim()
    setDraft('')
    setSending(true)
    setGroupMessages((prev) => [...prev, { id: `tmp-${Date.now()}`, sender: 'me', text, time: formatTime(new Date().toISOString()), senderName: 'Me' }])
    try {
      await api.post(`/chat/groups/${selectedGroupId}/send`, { message: text })
      await loadGroupMessages(selectedGroupId)
    } catch (err) {
      console.error('Failed to send group message', err)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (selectedGroupId) {
        sendGroupMessage()
      } else {
        sendMessage()
      }
    }
  }

  const selectPerson = (id) => {
    setSelectedPersonId(id)
    setSelectedGroupId('')
    setMobileShowChat(true)
  }

  const selectGroup = (id) => {
    setSelectedGroupId(id)
    setSelectedPersonId('')
    setMobileShowChat(true)
  }

  const PersonRow = ({ person, colorIdx }) => {
    const color = palette[colorIdx % palette.length]
    const isSelected = person.id === selectedPersonId
    return (
      <button type="button" onClick={() => selectPerson(person.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-all border-b" style={{ backgroundColor: isSelected ? ACCENT_LIGHT : 'transparent', borderColor: ACCENT_BORDER, borderLeft: isSelected ? `3px solid ${ACCENT}` : '3px solid transparent' }}>
        <Avatar name={person.name} color={color} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold mb-0.5" style={{ color: DARK }}>{person.name}</p>
          <RoleBadge role={person.role} />
        </div>
        <span className="flex-shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: person.status === 'Active' ? '#10B981' : '#9CA3AF' }} />
      </button>
    )
  }

  const GroupRow = ({ group }) => {
    const isSelected = group.id === selectedGroupId
    return (
      <button type="button" onClick={() => selectGroup(group.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-all border-b" style={{ backgroundColor: isSelected ? ACCENT_LIGHT : 'transparent', borderColor: ACCENT_BORDER, borderLeft: isSelected ? `3px solid ${ACCENT}` : '3px solid transparent' }}>
        <Avatar name={group.name} color="#10B981" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold mb-0.5" style={{ color: DARK }}>{group.name}</p>
          <p className="text-[11px] truncate" style={{ color: TEXT_MID }}>{group.description || `${group.memberCount || 0} members`}</p>
        </div>
        <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: ACCENT_LIGHT, color: ACCENT }}>{group.memberCount || 0}</span>
      </button>
    )
  }

  const activeMessages = selectedGroupId ? groupMessages : messages
  const activeThreadName = selectedGroup ? selectedGroup.name : selectedPerson?.name || 'Chat'
  const activeThreadColor = selectedGroup ? '#10B981' : selectedPerson?.role === 'Admin' ? ACCENT : palette[2]

  const ConversationPanel = () => (
    <section className="flex flex-col min-h-0 flex-1">
      {selectedPerson || selectedGroup ? (
        <>
          <div className="flex items-center gap-3 border-b px-4 py-3 flex-shrink-0" style={{ borderColor: ACCENT_BORDER, backgroundColor: CHAT_BG }}>
            <button type="button" onClick={() => setMobileShowChat(false)} className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg mr-1 transition-colors" style={{ backgroundColor: ACCENT_LIGHT }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={ACCENT} strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <Avatar name={activeThreadName} color={activeThreadColor} size={40} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight" style={{ color: DARK }}>{activeThreadName}</p>
              {selectedGroup ? (
                <div className="mt-0.5 flex items-center gap-2 text-[11px]" style={{ color: TEXT_MID }}>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full" style={{ backgroundColor: ACCENT_LIGHT, color: ACCENT }}>Group</span>
                  <span>{selectedGroup.memberCount || 0} members</span>
                </div>
              ) : (
                <div className="mt-0.5"><RoleBadge role={selectedPerson.role} /></div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: selectedGroup ? '#059669' : selectedPerson?.status === 'Active' ? '#059669' : '#6B7280' }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selectedGroup ? '#10B981' : selectedPerson?.status === 'Active' ? '#10B981' : '#9CA3AF' }} />
              {selectedGroup ? `${selectedGroup.memberCount || 0} members` : (selectedPerson?.status || 'Active')}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white px-5 py-4 space-y-3 min-h-0">
            {selectedGroup ? (
              loadingGroupMessages ? (
                <div className="flex items-center gap-2 text-sm py-6" style={{ color: TEXT_MID }}>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                  Loading messages…
                </div>
              ) : activeMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: ACCENT_LIGHT }}>
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke={ACCENT} strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </div>
                  <p className="text-sm font-medium" style={{ color: TEXT_MID }}>Start the conversation in {selectedGroup.name}</p>
                </div>
              ) : (
                activeMessages.map((msg) => (
                  <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender !== 'me' && <Avatar name={msg.senderName || selectedGroup.name} color="#10B981" size={28} />}
                    <div className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.sender === 'me' ? 'rounded-br-sm' : 'rounded-bl-sm'}`} style={{ backgroundColor: msg.sender === 'me' ? ACCENT : '#F5F3FF', color: msg.sender === 'me' ? '#fff' : DARK }}>
                      {msg.sender !== 'me' && <p className="mb-1 text-[10px] font-semibold opacity-80">{msg.senderName || 'Group member'}</p>}
                      <p className="leading-relaxed break-words">{msg.text}</p>
                      <p className="mt-1 text-[10px] opacity-70">{msg.time}</p>
                    </div>
                  </div>
                ))
              )
            ) : (
              loadingMessages ? (
                <div className="flex items-center gap-2 text-sm py-6" style={{ color: TEXT_MID }}>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                  Loading messages…
                </div>
              ) : activeMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: ACCENT_LIGHT }}>
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke={ACCENT} strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </div>
                  <p className="text-sm font-medium" style={{ color: TEXT_MID }}>Start the conversation with {selectedPerson.name}</p>
                </div>
              ) : (
                activeMessages.map((msg) => (
                  <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender !== 'me' && <Avatar name={selectedPerson.name} color={selectedPerson.role === 'Admin' ? ACCENT : palette[2]} size={28} />}
                    <div className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.sender === 'me' ? 'rounded-br-sm' : 'rounded-bl-sm'}`} style={{ backgroundColor: msg.sender === 'me' ? ACCENT : '#F5F3FF', color: msg.sender === 'me' ? '#fff' : DARK }}>
                      <p className="leading-relaxed break-words">{msg.text}</p>
                      <p className="mt-1 text-[10px] opacity-70">{msg.time}</p>
                    </div>
                  </div>
                ))
              )
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t px-4 py-3 flex-shrink-0" style={{ borderColor: ACCENT_BORDER, backgroundColor: CHAT_BG }}>
            <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: '#F3EBFF', border: `1px solid ${ACCENT_BORDER}` }}>
              <textarea ref={inputRef} rows={1} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={handleKeyDown} placeholder={selectedGroup ? `Message ${selectedGroup.name}…` : `Message ${selectedPerson.name}…`} className="flex-1 bg-transparent text-sm outline-none resize-none leading-relaxed" style={{ color: DARK, maxHeight: 96 }} />
              <button type="button" onClick={selectedGroup ? sendGroupMessage : sendMessage} disabled={!draft.trim() || sending} className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:opacity-40 flex-shrink-0" style={{ backgroundColor: ACCENT, color: '#fff' }}>
                {sending ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                )}
                Send
              </button>
            </div>
            <p className="mt-1 text-[10px] text-right" style={{ color: '#9B8AB8' }}>Enter to send · Shift+Enter for new line</p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: ACCENT_LIGHT }}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke={ACCENT} strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
          </div>
          <p className="text-sm font-medium" style={{ color: TEXT_MID }}>Select a contact or group to start chatting</p>
        </div>
      )}
    </section>
  )

  const ContactsSidebar = () => (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: ACCENT_BORDER }}>
        <div>
          <h2 className="text-base font-bold" style={{ color: DARK }}>Contacts</h2>
          <p className="text-[10px] mt-0.5" style={{ color: TEXT_MID }}>{filteredPeople.length} contact{filteredPeople.length !== 1 ? 's' : ''}</p>
        </div>
        <button type="button" onClick={() => setShowGroupModal(true)} title="Create Group" className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all" style={{ backgroundColor: ACCENT_LIGHT, color: ACCENT, border: `1px solid ${ACCENT_BORDER}` }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ACCENT; e.currentTarget.style.color = '#fff' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ACCENT_LIGHT; e.currentTarget.style.color = ACCENT }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <span className="hidden sm:inline">Group</span>
        </button>
      </div>

      <div className="px-3 py-2 border-b flex-shrink-0" style={{ borderColor: ACCENT_BORDER }}>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: '#EDE8F8', border: `1px solid ${ACCENT_BORDER}` }}>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={TEXT_MID} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contacts…" className="w-full bg-transparent text-sm outline-none" style={{ color: DARK }} />
          {search && <button type="button" onClick={() => setSearch('')} className="text-xs flex-shrink-0" style={{ color: TEXT_MID }}>✕</button>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {groups.length > 0 && (
          <div>
            <div className="px-4 pt-3 pb-1.5 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#10B981" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#10B981' }}>Groups</p>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(16,185,129,0.10)', color: '#047857' }}>{groups.length}</span>
            </div>
            {groups.map((group) => <GroupRow key={group.id} group={group} />)}
          </div>
        )}

        {loadingPeople ? (
          <div className="flex items-center gap-2 p-6 text-sm" style={{ color: TEXT_MID }}><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Loading contacts…</div>
        ) : filteredPeople.length === 0 ? (
          <div className="p-6 text-sm text-center" style={{ color: TEXT_MID }}>No contacts found.</div>
        ) : (
          <>
            {adminContacts.length > 0 && (
              <div>
                <div className="px-4 pt-3 pb-1.5 flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke={ACCENT} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Admins</p>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: ACCENT_LIGHT, color: ACCENT }}>{adminContacts.length}</span>
                </div>
                {adminContacts.map((p, i) => <PersonRow key={p.id} person={p} colorIdx={i} />)}
              </div>
            )}

            {userContacts.length > 0 && (
              <div>
                <div className={`px-4 pb-1.5 flex items-center gap-1.5 ${adminContacts.length > 0 ? 'pt-3 border-t mt-1' : 'pt-3'}`} style={{ borderColor: ACCENT_BORDER }}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke={TEXT_MID} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: TEXT_MID }}>Users</p>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: ACCENT_LIGHT, color: ACCENT }}>{userContacts.length}</span>
                </div>
                {userContacts.map((p, i) => <PersonRow key={p.id} person={p} colorIdx={i + adminContacts.length} />)}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )

  return (
    <Layout>
      {showGroupModal && (
        <CreateGroupModal
          people={people}
          onClose={() => setShowGroupModal(false)}
          onCreate={(group) => {
            if (!group) return
            setGroups((prev) => [group, ...prev])
            setSelectedGroupId(group.id)
            setSelectedPersonId('')
            setMobileShowChat(true)
          }}
        />
      )}

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: DARK }}>Chat</h1>
            <p className="mt-1 text-sm" style={{ color: TEXT_MID }}>Message admins, users, and group conversations</p>
          </div>
          <button type="button" onClick={() => setShowGroupModal(true)} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all shadow-sm" style={{ backgroundColor: ACCENT, color: '#fff' }} onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88' }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Create Group
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl shadow-sm" style={{ backgroundColor: CHAT_BG, border: `1px solid ${ACCENT_BORDER}` }}>
          <div className="min-h-[680px]">
            <div className="lg:hidden flex flex-col" style={{ minHeight: 680 }}>
              {!mobileShowChat ? (
                <aside className="flex flex-col flex-1" style={{ backgroundColor: PANEL_BG }}>
                  <ContactsSidebar />
                </aside>
              ) : (
                <ConversationPanel />
              )}
            </div>

            <div className="hidden lg:grid lg:grid-cols-[340px_minmax(0,1fr)]" style={{ minHeight: 680 }}>
              <aside className="flex flex-col border-r" style={{ backgroundColor: PANEL_BG, borderColor: ACCENT_BORDER }}>
                <ContactsSidebar />
              </aside>
              <ConversationPanel />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
