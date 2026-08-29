import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { api } from '../api/client'

const palette = ['#7C3AED', '#8B5CF6', '#10B981', '#64748B', '#F97316', '#3B82F6']

function formatTime(value) {
  if (!value) return 'Now'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export default function Chat() {
  const [people, setPeople] = useState([])
  const [search, setSearch] = useState('')
  const [selectedPersonId, setSelectedPersonId] = useState('')
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loadingPeople, setLoadingPeople] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)

  const fetchPeople = async (query = '') => {
    try {
      setLoadingPeople(true)
      const res = await api.get(`/chat/people${query ? `?search=${encodeURIComponent(query)}` : ''}`)
      const list = res?.data || []
      setPeople(list)
      if (!selectedPersonId && list[0]) setSelectedPersonId(list[0].id)
      if (selectedPersonId && !list.some((person) => person.id === selectedPersonId) && list[0]) {
        setSelectedPersonId(list[0].id)
      }
    } catch (err) {
      console.error('Failed to load chat people', err)
      setPeople([])
    } finally {
      setLoadingPeople(false)
    }
  }

  useEffect(() => {
    fetchPeople(search)
  }, [search])

  useEffect(() => {
    if (!selectedPersonId) return
    const loadMessages = async () => {
      try {
        setLoadingMessages(true)
        const res = await api.get(`/chat/messages/${selectedPersonId}`)
        const list = (res?.data || []).map((message) => ({
          id: message.id,
          sender: message.isMine ? 'me' : 'them',
          text: message.message,
          time: formatTime(message.createdAt),
        }))
        setMessages(list)
      } catch (err) {
        console.error('Failed to load chat messages', err)
        setMessages([])
      } finally {
        setLoadingMessages(false)
      }
    }

    loadMessages()
  }, [selectedPersonId])

  const filteredPeople = useMemo(() => {
    return people.filter((person) => {
      const haystack = `${person.name || ''} ${person.role || ''}`.toLowerCase()
      return haystack.includes(search.toLowerCase())
    })
  }, [people, search])

  const selectedPerson = filteredPeople.find((person) => person.id === selectedPersonId)
    || people.find((person) => person.id === selectedPersonId)
    || null

  const sendMessage = async () => {
    if (!selectedPerson || !draft.trim()) return
    try {
      await api.post('/chat/send', {
        receiverId: selectedPerson.id,
        message: draft.trim(),
      })
      setDraft('')
      const res = await api.get(`/chat/messages/${selectedPerson.id}`)
      const list = (res?.data || []).map((message) => ({
        id: message.id,
        sender: message.isMine ? 'me' : 'them',
        text: message.message,
        time: formatTime(message.createdAt),
      }))
      setMessages(list)
    } catch (err) {
      console.error('Failed to send chat message', err)
    }
  }

  return (
    <Layout>
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#1A0A2E' }}>Chat</h1>
          <p className="mt-2 text-base" style={{ color: '#5B4B68' }}>People and conversations</p>
        </div>

        <div className="overflow-hidden rounded-2xl shadow-sm" style={{ backgroundColor: '#FFFCFF', border: '1px solid rgba(124,58,237,0.14)' }}>
          <div className="grid min-h-[680px] lg:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="border-b lg:border-b-0 lg:border-r" style={{ backgroundColor: '#F7F3FF', borderColor: 'rgba(124,58,237,0.12)' }}>
              <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'rgba(124,58,237,0.12)' }}>
                <h2 className="text-lg font-semibold" style={{ color: '#1A0A2E' }}>People</h2>
                <button type="button" className="rounded-full p-2 transition hover:opacity-80" style={{ backgroundColor: 'rgba(124,58,237,0.12)', color: '#7C3AED' }} aria-label="Search people">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>

              <div className="px-3 py-3 border-b" style={{ borderColor: 'rgba(124,58,237,0.12)' }}>
                <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: '#F3EBFF', border: '1px solid rgba(124,58,237,0.12)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#6B7280' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search people" className="w-full bg-transparent text-sm outline-none" style={{ color: '#1A0A2E' }} />
                </div>
              </div>

              <div className="max-h-[560px] overflow-y-auto">
                {loadingPeople ? (
                  <div className="p-6 text-sm" style={{ color: '#5B4B68' }}>Loading people…</div>
                ) : filteredPeople.length === 0 ? (
                  <div className="p-6 text-sm" style={{ color: '#5B4B68' }}>No people found.</div>
                ) : (
                  filteredPeople.map((person, index) => {
                    const color = palette[index % palette.length]
                    const avatar = person.avatar || (person.name || 'U').split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()
                    const isSelected = person.id === selectedPersonId
                    return (
                      <button key={person.id} type="button" onClick={() => setSelectedPersonId(person.id)} className="flex w-full items-center gap-3 border-b px-4 py-3 text-left transition" style={{ backgroundColor: isSelected ? 'rgba(124,58,237,0.08)' : 'transparent', borderColor: 'rgba(124,58,237,0.08)' }}>
                        <div className="flex h-11 w-11 items-center justify-center rounded-full font-semibold text-xs" style={{ backgroundColor: color, color: '#fff' }}>{avatar}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate font-semibold" style={{ color: '#1A0A2E' }}>{person.name}</p>
                            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: person.status === 'Active' ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.12)', color: person.status === 'Active' ? '#047857' : '#475569' }}>{person.status || 'Active'}</span>
                          </div>
                          <p className="text-xs" style={{ color: '#6B7280' }}>{person.role}</p>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </aside>

            <section className="flex min-h-0 flex-col">
              {selectedPerson ? (
                <>
                  <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'rgba(124,58,237,0.12)' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full font-semibold text-xs" style={{ backgroundColor: palette[0], color: '#fff' }}>{(selectedPerson.name || 'U').split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()}</div>
                      <div>
                        <p className="font-semibold" style={{ color: '#1A0A2E' }}>{selectedPerson.name}</p>
                        <p className="text-xs" style={{ color: '#6B7280' }}>{selectedPerson.role}</p>
                      </div>
                    </div>
                    <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#047857' }}>{selectedPerson.status || 'Active'}</span>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto bg-white px-5 py-5">
                    {loadingMessages ? (
                      <div className="text-sm text-gray-400">Loading messages…</div>
                    ) : messages.length === 0 ? (
                      <div className="text-sm text-gray-400">No messages yet.</div>
                    ) : (
                      messages.map((message) => (
                        <div key={message.id} className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-[75%] rounded-2xl px-4 py-3 text-sm" style={{ backgroundColor: message.sender === 'me' ? '#7C3AED' : '#F5F3FF', color: message.sender === 'me' ? '#fff' : '#1A0A2E' }}>
                            <p>{message.text}</p>
                            <p className={`mt-2 text-[10px] ${message.sender === 'me' ? 'text-white/80' : 'text-[#6B7280]'}`}>{message.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t px-4 py-3" style={{ borderColor: 'rgba(124,58,237,0.12)', backgroundColor: '#FFFCFF' }}>
                    <div className="flex items-center gap-3 rounded-xl px-3 py-2" style={{ backgroundColor: '#F7F3FF', border: '1px solid rgba(124,58,237,0.12)' }}>
                      <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message..." className="flex-1 bg-transparent py-2 text-sm outline-none" style={{ color: '#1A0A2E' }} onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }} />
                      <button type="button" onClick={sendMessage} className="rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: '#7C3AED', color: '#fff' }}>Send</button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">Select a person to start chatting</div>
              )}
            </section>
          </div>
        </div>
      </div>
    </Layout>
  )
}
