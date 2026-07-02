import { useState, useEffect } from 'react'
import { Search, ChevronLeft, ChevronRight, ArrowRight, MapPin, Clock, CalendarDays, CheckCircle2, Plus, X, Edit3, Trash2, Menu, Sun, Moon } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import EmptyState from '../components/EmptyState'
import Dropdown from '../components/Dropdown'
import { useTheme } from '../context/ThemeContext'
import { getNotices, getEvents, createNotice, updateNotice, deleteNotice, createEvent, updateEvent, deleteEvent } from '../api'

const CATEGORIES = ['All', 'Academic', 'Library', 'Facility', 'Events', 'Finance', 'Tech', 'Cultural', 'Sports']

function formatDate(d) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }

function CategoryBadge({ cat }) {
  const colors = {
    Academic: 'bg-[#EDE9FE] text-[#6C5CE7] dark:bg-[rgba(124,92,255,0.15)] dark:text-[#7C5CFF]',
    Library: 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400',
    Facility: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
    Events: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
    Finance: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
    Tech: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400',
    Cultural: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400',
    Sports: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  }
  return <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${colors[cat] || 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>{cat}</span>
}

const emptyNotice = { title: '', description: '', category: '' }
const emptyEvent = { title: '', description: '', date: '', venue: '', time: '', category: '' }

export default function NoticeEvents() {
  const { dark, toggle } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tab, setTab] = useState('notices')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 4
  const [noticesData, setNoticesData] = useState({ notices: [], total: 0, totalPages: 0 })
  const [eventsData, setEventsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyNotice)
  const [formErrors, setFormErrors] = useState({})
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user.role === 'Admin'

  useEffect(() => {
    setLoading(true)
    if (tab === 'notices') {
      getNotices({ search, category: filter, page, limit: ITEMS_PER_PAGE })
        .then(setNoticesData)
        .catch(console.error)
        .finally(() => setLoading(false))
    } else {
      getEvents({ search, category: filter })
        .then(res => { setEventsData(res.events); setLoading(false) })
        .catch(console.error)
    }
  }, [tab, search, filter, page])

  function handleTabChange(newTab) { setTab(newTab); setPage(1); setSearch(''); setFilter('All') }

  function openCreateForm() {
    setEditing(null)
    setForm(tab === 'notices' ? { ...emptyNotice } : { ...emptyEvent })
    setFormErrors({})
    setShowForm(true)
  }

  function openEditForm(item) {
    setEditing(item)
    if (tab === 'notices') {
      setForm({ title: item.title, description: item.description, category: item.category || '' })
    } else {
      setForm({
        title: item.title,
        description: item.description,
        date: item.date ? item.date.slice(0, 10) : '',
        venue: item.venue || '',
        time: item.time || '',
        category: item.category || '',
      })
    }
    setFormErrors({})
    setShowForm(true)
  }

  function handleFormChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleFormSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.description.trim()) errs.description = 'Description is required'
    if (tab === 'events' && !form.date) errs.date = 'Date is required'
    if (tab === 'events' && !form.venue.trim()) errs.venue = 'Venue is required'
    setFormErrors(errs)
    if (Object.keys(errs).length) return

    try {
      if (tab === 'notices') {
        if (editing) await updateNotice(editing._id, form)
        else await createNotice(form)
      } else {
        if (editing) await updateEvent(editing._id, form)
        else await createEvent(form)
      }
      setShowForm(false)
      setEditing(null)
      setForm(tab === 'notices' ? { ...emptyNotice } : { ...emptyEvent })
      if (tab === 'notices') {
        const res = await getNotices({ search, category: filter, page, limit: ITEMS_PER_PAGE })
        setNoticesData(res)
      } else {
        const res = await getEvents({ search, category: filter })
        setEventsData(res.events)
      }
    } catch (err) {
      setFormErrors({ submit: err.message })
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this item?')) return
    try {
      if (tab === 'notices') {
        await deleteNotice(id)
        const res = await getNotices({ search, category: filter, page, limit: ITEMS_PER_PAGE })
        setNoticesData(res)
      } else {
        await deleteEvent(id)
        const res = await getEvents({ search, category: filter })
        setEventsData(res.events)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 lg:bg-fixed overflow-x-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-4 px-6 md:px-8 h-16 bg-white/85 backdrop-blur-lg border-b border-gray-200 dark:bg-gray-900/85 dark:border-gray-700/50">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 cursor-pointer"><Menu size={22} /></button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{tab === 'notices' ? 'Notices & Announcements' : 'Campus Events'}</h1>
          <button onClick={toggle} className="ml-auto p-2 rounded-lg text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer" aria-label="Toggle theme">
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full animate-fadeIn">
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{tab === 'notices' ? 'Notices' : 'Events'}</h1>
              <p className="text-sm text-gray-500 dark:text-[#94A3B8] mt-1">{tab === 'notices' ? 'Stay updated with all campus announcements.' : 'Discover and register for campus events.'}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-xl px-3.5">
                <Search size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
                <input type="text" placeholder={`Search ${tab}...`} value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="flex-1 bg-transparent border-none outline-none py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 w-40" />
              </div>
              <Dropdown value={filter} onChange={setFilter} options={CATEGORIES.map(c => ({ value: c, label: c }))} className="min-w-[120px]" />
            {isAdmin && (
              <button onClick={openCreateForm} className="flex items-center gap-2 text-sm font-semibold bg-[#6C5CE7] text-white px-4 py-2.5 rounded-xl hover:bg-[#5B4BD6] dark:bg-[#7C5CFF] dark:hover:bg-[#6B4BEE] transition-all cursor-pointer">
                <Plus size={17} /> {tab === 'notices' ? 'Add Notice' : 'Add Event'}
              </button>
            )}
          </div>
        </div>

          <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
            {['notices', 'events'].map(t => (
              <button key={t} onClick={() => handleTabChange(t)} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${tab === t ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'}`}>
                {t === 'notices' ? 'Notices' : 'Events'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading...</div>
          ) : tab === 'notices' ? (
            <>
              {noticesData.notices.length === 0 ? <EmptyState message="No notices found." /> : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    {noticesData.notices.map(n => (
                      <div key={n._id} className="rounded-2xl p-5 border border-gray-200 dark:border-white/10 hover:bg-gray-50/50 dark:hover:bg-white/[0.03] transition-all relative group">
                        {isAdmin && (
                          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditForm(n)} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-[#EDE9FE] hover:text-[#6C5CE7] cursor-pointer"><Edit3 size={14} /></button>
                            <button onClick={() => handleDelete(n._id)} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-50 hover:text-red-600 cursor-pointer"><Trash2 size={14} /></button>
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-3">
                          <CategoryBadge cat={n.category} />
                          <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(n.createdAt)}</span>
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">{n.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-[#94A3B8] leading-relaxed mb-4">{n.description}</p>
                      </div>
                    ))}
                  </div>
                  {noticesData.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-8">
                      <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-40 cursor-pointer"><ChevronLeft size={16} /> Previous</button>
                      <div className="flex gap-1.5">
                        {Array.from({ length: noticesData.totalPages }, (_, i) => i + 1).map(n => (
                          <button key={n} onClick={() => setPage(n)} className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all cursor-pointer ${page === n ? 'bg-[#6C5CE7] dark:bg-[#7C5CFF] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}>{n}</button>
                        ))}
                      </div>
                      <button disabled={page === noticesData.totalPages} onClick={() => setPage(p => Math.min(noticesData.totalPages, p + 1))} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-40 cursor-pointer">Next <ChevronRight size={16} /></button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {eventsData.length === 0 ? <EmptyState message="No events found." /> : (
                <div className="grid md:grid-cols-2 gap-4">
                  {eventsData.map(e => (
                    <EventCard key={e._id} event={e} isAdmin={isAdmin} onEdit={openEditForm} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fadeIn" onClick={() => setShowForm(false)}>
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl w-full max-w-lg mx-4 p-6 shadow-2xl border border-gray-200 dark:border-white/10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editing ? `Edit ${tab === 'notices' ? 'Notice' : 'Event'}` : `Add ${tab === 'notices' ? 'Notice' : 'Event'}`}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800 cursor-pointer"><X size={20} /></button>
              </div>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Title <span className="text-red-500">*</span></label>
                  <input type="text" name="title" value={form.title} onChange={handleFormChange} placeholder="Title" className={`w-full border ${formErrors.title ? 'border-red-400' : 'border-gray-200 dark:border-white/10'} rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#6C5CE7] dark:focus:border-[#7C5CFF] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:bg-[#1E293B]`} />
                  {formErrors.title && <span className="text-xs text-red-500 mt-1">{formErrors.title}</span>}
                </div>
                {tab === 'notices' ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                      <Dropdown value={form.category} onChange={val => setForm(p => ({ ...p, category: val }))} options={[{ value: '', label: 'General' }, ...CATEGORIES.filter(c => c !== 'All').map(c => ({ value: c, label: c }))]} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description <span className="text-red-500">*</span></label>
                      <textarea name="description" value={form.description} onChange={handleFormChange} rows={4} placeholder="Notice content..." className={`w-full border ${formErrors.description ? 'border-red-400' : 'border-gray-200 dark:border-white/10'} rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#6C5CE7] dark:focus:border-[#7C5CFF] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none dark:bg-[#1E293B]`} />
                      {formErrors.description && <span className="text-xs text-red-500 mt-1">{formErrors.description}</span>}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Date <span className="text-red-500">*</span></label>
                        <input type="date" name="date" value={form.date} onChange={handleFormChange} className={`w-full border ${formErrors.date ? 'border-red-400' : 'border-gray-200 dark:border-white/10'} rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#6C5CE7] dark:focus:border-[#7C5CFF] transition-all dark:bg-[#1E293B]`} />
                        {formErrors.date && <span className="text-xs text-red-500 mt-1">{formErrors.date}</span>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Time</label>
                        <input type="time" name="time" value={form.time} onChange={handleFormChange} className="w-full border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#6C5CE7] dark:focus:border-[#7C5CFF] transition-all dark:bg-[#1E293B]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Venue <span className="text-red-500">*</span></label>
                      <input type="text" name="venue" value={form.venue} onChange={handleFormChange} placeholder="Auditorium A" className={`w-full border ${formErrors.venue ? 'border-red-400' : 'border-gray-200 dark:border-white/10'} rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#6C5CE7] dark:focus:border-[#7C5CFF] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:bg-[#1E293B]`} />
                      {formErrors.venue && <span className="text-xs text-red-500 mt-1">{formErrors.venue}</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                      <Dropdown value={form.category} onChange={val => setForm(p => ({ ...p, category: val }))} options={[{ value: '', label: 'General' }, ...CATEGORIES.filter(c => c !== 'All').map(c => ({ value: c, label: c }))]} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description <span className="text-red-500">*</span></label>
                      <textarea name="description" value={form.description} onChange={handleFormChange} rows={3} placeholder="Event description..." className={`w-full border ${formErrors.description ? 'border-red-400' : 'border-gray-200 dark:border-white/10'} rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#6C5CE7] dark:focus:border-[#7C5CFF] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none dark:bg-[#1E293B]`} />
                      {formErrors.description && <span className="text-xs text-red-500 mt-1">{formErrors.description}</span>}
                    </div>
                  </>
                )}
                {formErrors.submit && <div className="text-xs text-red-500">{formErrors.submit}</div>}
                <button type="submit" className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-[#6C5CE7] text-white py-3 rounded-xl hover:bg-[#5B4BD6] dark:bg-[#7C5CFF] dark:hover:bg-[#6B4BEE] transition-all cursor-pointer">
                  {editing ? 'Update' : 'Publish'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EventCard({ event: e, isAdmin, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden hover:bg-gray-50/50 dark:hover:bg-white/[0.03] transition-all relative group">
      {isAdmin && (
        <div className="absolute top-3 right-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(e)} className="p-1.5 rounded-lg bg-white/90 dark:bg-gray-900/90 text-gray-500 hover:bg-[#EDE9FE] hover:text-[#6C5CE7] cursor-pointer shadow-sm"><Edit3 size={14} /></button>
          <button onClick={() => onDelete(e._id)} className="p-1.5 rounded-lg bg-white/90 dark:bg-gray-900/90 text-gray-500 hover:bg-red-50 hover:text-red-600 cursor-pointer shadow-sm"><Trash2 size={14} /></button>
        </div>
      )}
      <div className="h-28 relative flex items-center justify-center p-4 bg-gradient-to-r from-[#6C5CE7] to-[#00D4FF]">
        <span className="absolute top-3 right-3 text-[10px] font-bold text-white/90 bg-white/20 px-2 py-0.5 rounded">{e.category}</span>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-[#94A3B8] mb-2">
          <span className="flex items-center gap-1.5"><CalendarDays size={13} /> {formatDate(e.date)}</span>
          <span className="flex items-center gap-1.5"><Clock size={13} /> {e.time || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#94A3B8] mb-2.5"><MapPin size={13} /> {e.venue}</div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">{e.title}</h3>
        <p className="text-xs text-gray-500 dark:text-[#94A3B8] leading-relaxed mb-4">{e.description}</p>
      </div>
    </div>
  )
}
