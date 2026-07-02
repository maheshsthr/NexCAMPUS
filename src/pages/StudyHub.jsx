import { useState, useEffect, useRef } from 'react'
import { Search, Menu, BookOpen, Library, Download, Upload, X, Trash2, FileText, Sun, Moon } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Dropdown from '../components/Dropdown'
import { useTheme } from '../context/ThemeContext'
import { getStudyMaterials, uploadStudyMaterial, deleteStudyMaterial, incrementDownload } from '../api'

const SECTIONS = [
  { key: 'notes', label: 'Notes', icon: BookOpen, barClass: 'bg-[#6C5CE7]', badgeClass: 'text-[#6C5CE7] bg-[#EDE9FE] dark:text-[#7C5CFF] dark:bg-[rgba(124,92,255,0.15)]' },
  { key: 'syllabus', label: 'Syllabus', icon: Library, barClass: 'bg-[#DC2626]', badgeClass: 'text-[#DC2626] bg-[#FEE2E2] dark:text-red-400 dark:bg-red-950/40' },
]

const SEMESTERS = ['All', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']

export default function StudyHub() {
  const { dark, toggle } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tab, setTab] = useState('notes')
  const [search, setSearch] = useState('')
  const [semester, setSemester] = useState('All')
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState(null)
  const [form, setForm] = useState({ title: '', type: 'notes', subject: '', semester: '' })
  const fileRef = useRef()

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user.role === 'Admin'

  function load() {
    setLoading(true)
    const params = { type: tab }
    if (search) params.search = search
    if (semester !== 'All') params.semester = semester
    getStudyMaterials(params)
      .then(res => setMaterials(res.materials || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [tab, search, semester])

  async function handleDownload(item) {
    try {
      await incrementDownload(item._id)
      window.open(item.file_url, '_blank')
    } catch (err) {
      window.open(item.file_url, '_blank')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this material?')) return
    try {
      await deleteStudyMaterial(id)
      load()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!file || !form.title.trim()) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('title', form.title.trim())
      fd.append('type', form.type)
      if (form.subject.trim()) fd.append('subject', form.subject.trim())
      if (form.semester.trim()) fd.append('semester', form.semester.trim())
      await uploadStudyMaterial(fd)
      setForm({ title: '', type: 'notes', subject: '', semester: '' })
      setFile(null)
      setShowUpload(false)
      load()
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const currentSection = SECTIONS.find(s => s.key === tab)

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 lg:bg-fixed overflow-x-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 md:px-8 h-16 bg-white/85 backdrop-blur-lg border-b border-gray-200 dark:bg-gray-900/85 dark:border-gray-700/50">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 cursor-pointer"><Menu size={22} /></button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Study Hub</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="p-2 rounded-lg text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer" aria-label="Toggle theme">
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {isAdmin && (
              <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 text-sm font-semibold bg-[#6C5CE7] text-white px-4 py-2 rounded-xl hover:bg-[#5B4BD6] dark:bg-[#7C5CFF] dark:hover:bg-[#6B4BEE] transition-all cursor-pointer"><Upload size={16} /> Upload</button>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full animate-fadeIn">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Study Hub</h1>
            <p className="text-sm text-gray-500 dark:text-[#94A3B8] mt-1">Access notes and syllabus uploaded by your college.</p>
          </div>

          <div className="flex gap-1 mb-5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex-wrap">
            {SECTIONS.map(s => {
              const Icon = s.icon
              return (
                <button key={s.key} onClick={() => { setTab(s.key); setSearch(''); setSemester('All') }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${tab === s.key ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'}`}>
                  <Icon size={16} />
                  {s.label}
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 flex-1 min-w-0 max-w-xs">
              <Search size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
              <input type="text" placeholder={`Search ${currentSection?.label.toLowerCase()}...`} value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent border-none outline-none py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 min-w-0" />
            </div>
            <Dropdown value={semester} onChange={setSemester} options={SEMESTERS.map(s => ({ value: s, label: s === 'All' ? 'All Semesters' : `${s} Semester` }))} className="min-w-[140px]" />
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400 dark:text-gray-500">Loading...</div>
          ) : materials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
              <FileText size={48} className="mb-3" />
              <p className="text-sm font-medium">No {currentSection?.label.toLowerCase()} found.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map(m => (
                <div key={m._id} className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden hover:bg-gray-50/50 dark:hover:bg-white/[0.03] transition-all group relative">
                  <div className={`h-1.5 ${currentSection?.barClass}`} />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${currentSection?.badgeClass}`}>{currentSection?.label}</span>
                      {m.semester && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded dark:text-gray-400 dark:bg-gray-800">{m.semester} Sem</span>}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{m.title}</h3>
                    {m.subject && <p className="text-xs text-gray-500 dark:text-[#94A3B8] mb-2">{m.subject}</p>}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#94A3B8] mb-4">
                      <Download size={13} />
                      <span>{m.downloads} downloads</span>
                    </div>
                    <button onClick={() => handleDownload(m)} className="w-full flex items-center justify-center gap-2 text-xs font-semibold bg-[#6C5CE7] text-white py-2.5 rounded-xl hover:bg-[#5B4BD6] dark:bg-[#7C5CFF] dark:hover:bg-[#6B4BEE] transition-all cursor-pointer"><Download size={15} /> Download</button>
                  </div>
                  {isAdmin && (
                    <button onClick={() => handleDelete(m._id)} className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-sm text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer"><Trash2 size={14} /></button>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        {showUpload && isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fadeIn" onClick={() => { setShowUpload(false); setFile(null) }}>
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl w-full max-w-lg mx-4 p-6 shadow-2xl border border-gray-200 dark:border-white/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upload Study Material</h2>
                <button onClick={() => { setShowUpload(false); setFile(null) }} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800 cursor-pointer"><X size={20} /></button>
              </div>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
                  <Dropdown value={form.type} onChange={val => setForm(p => ({ ...p, type: val }))} options={[{ value: 'notes', label: 'Notes' }, { value: 'syllabus', label: 'Syllabus' }]} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
                  <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Data Structures Notes" className="w-full border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#6C5CE7] dark:focus:border-[#7C5CFF] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:bg-[#1E293B]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Subject (optional)</label>
                  <input type="text" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Computer Science" className="w-full border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#6C5CE7] dark:focus:border-[#7C5CFF] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:bg-[#1E293B]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Semester (optional)</label>
                  <Dropdown value={form.semester} onChange={val => setForm(p => ({ ...p, semester: val }))} options={[{ value: '', label: 'Select semester' }, ...['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map(s => ({ value: s, label: s }))]} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">File (PDF, DOC, DOCX, PPT, TXT)</label>
                  {file ? (
                    <div className="flex items-center gap-3 bg-[#EDE9FE] dark:bg-[rgba(124,92,255,0.15)] border border-[#6C5CE7]/20 dark:border-[#7C5CFF]/20 rounded-xl px-3.5 py-2.5">
                      <FileText size={18} className="text-[#6C5CE7] dark:text-[#7C5CFF] shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{file.name}</span>
                      <button type="button" onClick={() => setFile(null)} className="text-gray-400 dark:text-gray-500 hover:text-red-500 cursor-pointer"><X size={16} /></button>
                    </div>
                  ) : (
                    <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-[#6C5CE7] dark:hover:border-[#7C5CFF] transition-all">
                      <Upload size={24} className="mx-auto text-gray-300 dark:text-gray-600 mb-1" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Click to select a file</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" onChange={e => setFile(e.target.files[0])} className="hidden" />
                </div>
                <button type="submit" disabled={uploading || !file || !form.title.trim()} className="w-full text-sm font-semibold bg-[#6C5CE7] text-white py-3 rounded-xl hover:bg-[#5B4BD6] dark:bg-[#7C5CFF] dark:hover:bg-[#6B4BEE] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
