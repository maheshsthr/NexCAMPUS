import { useState, useEffect } from 'react'
import { Search, Plus, Menu, X, AlertCircle, CheckCircle2, Clock, Sun, Moon, Trash2 } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Dropdown from '../components/Dropdown'
import { useTheme } from '../context/ThemeContext'
import { getComplaints, createComplaint, updateComplaintStatus, deleteComplaint } from '../api'

const CATEGORIES = ['Infrastructure', 'Food Services', 'Hostel', 'Academic', 'Cleanliness', 'Security', 'Transport', 'Other']

const STATUS_MAP = {
  'all': { label: 'All' },
  'pending': { label: 'Pending', badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', dotClass: 'bg-gray-500' },
  'in-progress': { label: 'In Progress', badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400', dotClass: 'bg-blue-500' },
  'resolved': { label: 'Resolved', badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400', dotClass: 'bg-emerald-500' },
}

export default function Complaints() {
  const { dark, toggle } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [complaints, setComplaints] = useState([])
  const [summary, setSummary] = useState({ pending: 0, 'in-progress': 0, resolved: 0, total: 0 })
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user.role === 'Admin'
  const [form, setForm] = useState({ title: '', category: '', description: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    getComplaints({ search, status: statusFilter })
      .then(res => {
        setComplaints(res.complaints)
        setSummary(res.summary)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, statusFilter])

  function validate() {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.category) errs.category = 'Select a category'
    if (!form.description.trim()) errs.description = 'Description is required'
    else if (form.description.trim().length < 20) errs.description = 'At least 20 characters'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return
    try {
      await createComplaint({
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
      })
      setForm({ title: '', category: '', description: '' })
      setShowForm(false)
      load()
    } catch (err) {
      setErrors({ submit: err.message })
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await updateComplaintStatus(id, newStatus)
      load()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this complaint?')) return
    try {
      await deleteComplaint(id)
      load()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 lg:bg-fixed overflow-x-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-4 px-6 md:px-8 h-16 bg-white/85 backdrop-blur-lg border-b border-gray-200 dark:bg-gray-900/85 dark:border-gray-700/50">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 cursor-pointer"><Menu size={22} /></button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Complaint Management</h1>
          <button onClick={toggle} className="ml-auto p-2 rounded-lg text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer" aria-label="Toggle theme">
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full animate-fadeIn">
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Complaints</h1>
              <p className="text-sm text-gray-500 dark:text-[#94A3B8] mt-1">{isAdmin ? 'Manage all campus complaints.' : 'Submit and track your complaints.'}</p>
            </div>
            {!isAdmin && (
              <button onClick={() => setShowForm(true)} className="flex items-center gap-2 text-sm font-semibold bg-[#6C5CE7] text-white px-5 py-2.5 rounded-xl hover:bg-[#5B4BD6] dark:bg-[#7C5CFF] dark:hover:bg-[#6B4BEE] transition-all cursor-pointer"><Plus size={17} /> New Complaint</button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Pending', value: summary.pending, dotClass: 'bg-gray-500' },
              { label: 'In Progress', value: summary['in-progress'], dotClass: 'bg-blue-500' },
              { label: 'Resolved', value: summary.resolved, dotClass: 'bg-emerald-500' },
              { label: 'Total', value: summary.total, dotClass: 'bg-gray-500' },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-[#1E293B] rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-[#94A3B8]">{s.label}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${s.dotClass}`} />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white mt-1 block">{s.value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-2 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 flex-1 min-w-0 max-w-xs">
              <Search size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
              <input type="text" placeholder="Search complaints..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent border-none outline-none py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 min-w-0" />
            </div>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex-wrap">
              {['all', 'pending', 'in-progress', 'resolved'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${statusFilter === s ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'}`}>
                  {STATUS_MAP[s].label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading...</div>
          ) : complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
              <AlertCircle size={48} className="mb-3" />
              <p className="text-sm font-medium">No complaints found.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-visible">
              <table className="w-full overflow-visible">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/50">
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-[#94A3B8] py-3.5 px-5">ID</th>
                    {isAdmin && <th className="text-left text-xs font-semibold text-gray-500 dark:text-[#94A3B8] py-3.5 px-5">Student</th>}
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-[#94A3B8] py-3.5 px-5">Title</th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-[#94A3B8] py-3.5 px-5">Category</th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-[#94A3B8] py-3.5 px-5">Date</th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-[#94A3B8] py-3.5 px-5">{isAdmin ? 'Actions' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => {
                    const s = STATUS_MAP[c.status]
                    const StatusIcon = c.status === 'resolved' ? CheckCircle2 : c.status === 'in-progress' ? Clock : AlertCircle
                    return (
                      <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0 dark:border-gray-800 dark:hover:bg-gray-800/50">
                        <td className="py-3.5 px-5 text-sm font-medium text-gray-900 dark:text-white">#{String(c._id).slice(-5)}</td>
                        {isAdmin && <td className="py-3.5 px-5 text-sm text-gray-600 dark:text-gray-400">{c.created_by?.name || 'Unknown'}</td>}
                        <td className="py-3.5 px-5">
                          <Link to={`/dashboard/complaints/${c._id}`} state={{ complaint: c, user }} className="text-sm font-semibold text-gray-900 dark:text-white block hover:text-[#6C5CE7] dark:hover:text-[#7C5CFF] transition-colors">{c.title}</Link>
                          <span className="text-xs text-gray-400 dark:text-gray-500 block mt-0.5">{c.description.slice(0, 80)}...</span>
                        </td>
                        <td className="py-3.5 px-5"><span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded dark:text-gray-300 dark:bg-gray-800">{c.category}</span></td>
                        <td className="py-3.5 px-5 text-sm text-gray-500 dark:text-[#94A3B8]">{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td className="py-3.5 px-5 relative">
                          {isAdmin ? (
                            <Dropdown value={c.status} onChange={val => handleStatusChange(c._id, val)} options={[{ value: 'pending', label: 'Pending' }, { value: 'in-progress', label: 'In Progress' }, { value: 'resolved', label: 'Resolved' }]} className="inline-flex" />
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${s.badgeClass}`}>
                                <StatusIcon size={12} />
                                {s.label}
                              </span>
                              <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer" title="Delete"><Trash2 size={14} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {showForm && !isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fadeIn" onClick={() => setShowForm(false)}>
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl w-full max-w-lg mx-4 p-6 shadow-2xl border border-gray-200 dark:border-white/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Submit a Complaint</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800 cursor-pointer"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Title <span className="text-red-500">*</span></label>
                  <input type="text" name="title" value={form.title} onChange={e => { setForm(p => ({ ...p, title: e.target.value })); setErrors(p => ({ ...p, title: '' })) }} placeholder="Brief title of your complaint" className={`w-full border ${errors.title ? 'border-red-400' : 'border-gray-200 dark:border-white/10'} rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#6C5CE7] dark:focus:border-[#7C5CFF] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:bg-[#1E293B]`} />
                  {errors.title && <span className="text-xs text-red-500 mt-1 block">{errors.title}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Category <span className="text-red-500">*</span></label>
                  <Dropdown value={form.category} onChange={val => { setForm(p => ({ ...p, category: val })); setErrors(p => ({ ...p, category: '' })) }} error={errors.category} options={[{ value: '', label: 'Select a category' }, ...CATEGORIES.map(cat => ({ value: cat, label: cat }))]} />
                  {errors.category && <span className="text-xs text-red-500 mt-1 block">{errors.category}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description <span className="text-red-500">*</span></label>
                  <textarea name="description" value={form.description} onChange={e => { setForm(p => ({ ...p, description: e.target.value })); setErrors(p => ({ ...p, description: '' })) }} placeholder="Describe your complaint in detail..." rows={4} className={`w-full border ${errors.description ? 'border-red-400' : 'border-gray-200 dark:border-white/10'} rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#6C5CE7] dark:focus:border-[#7C5CFF] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none dark:bg-[#1E293B]`} />
                  {errors.description && <span className="text-xs text-red-500 mt-1 block">{errors.description}</span>}
                </div>
                {errors.submit && <div className="text-xs text-red-500">{errors.submit}</div>}
                <button type="submit" className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-[#6C5CE7] text-white py-3 rounded-xl hover:bg-[#5B4BD6] dark:bg-[#7C5CFF] dark:hover:bg-[#6B4BEE] transition-all cursor-pointer"><CheckCircle2 size={17} /> Submit Complaint</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
