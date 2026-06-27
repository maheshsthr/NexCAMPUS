import { useState, useEffect, useRef } from 'react'
import { Search, Menu, Upload, Trash2, X, Image as ImageIcon, Sun, Moon } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useTheme } from '../context/ThemeContext'
import { getGallery, uploadGalleryImage, deleteGalleryImage } from '../api'

export default function Gallery() {
  const { dark, toggle } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user.role === 'Admin'
  const [showUpload, setShowUpload] = useState(false)
  const [form, setForm] = useState({ title: '', event_name: '' })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const fileRef = useRef()
  const [search, setSearch] = useState('')

  function load() {
    setLoading(true)
    getGallery()
      .then(res => setImages(res.images || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!file || !form.title.trim()) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('title', form.title.trim())
      if (form.event_name.trim()) fd.append('event_name', form.event_name.trim())
      await uploadGalleryImage(fd)
      setForm({ title: '', event_name: '' })
      setFile(null)
      setPreview(null)
      setShowUpload(false)
      load()
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this image?')) return
    try {
      await deleteGalleryImage(id)
      load()
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = images.filter(img =>
    img.title?.toLowerCase().includes(search.toLowerCase()) ||
    img.event_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 lg:bg-fixed overflow-x-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 md:px-8 h-16 bg-white/85 backdrop-blur-lg border-b border-gray-200 dark:bg-gray-900/85 dark:border-gray-700/50">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 cursor-pointer"><Menu size={22} /></button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Gallery</h1>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Gallery</h1>
            <p className="text-sm text-gray-500 dark:text-[#94A3B8] mt-1">Explore campus moments and events.</p>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 mb-6 max-w-xs">
            <Search size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
            <input type="text" placeholder="Search images..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent border-none outline-none py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 min-w-0" />
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400 dark:text-gray-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
              <ImageIcon size={48} className="mb-3" />
              <p className="text-sm font-medium">No images yet.</p>
              {isAdmin && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Upload your first campus photo.</p>}
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {filtered.map(img => (
                <div key={img._id} className="break-inside-avoid rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden hover:bg-gray-50/50 dark:hover:bg-white/[0.03] transition-all group relative">
                  <img src={img.image_url} alt={img.title} className="w-full object-cover" loading="lazy" />
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{img.title}</h3>
                    {img.event_name && <p className="text-xs text-gray-500 dark:text-[#94A3B8] mt-0.5">{img.event_name}</p>}
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">{new Date(img.createdAt).toLocaleDateString()}</p>
                  </div>
                  {isAdmin && (
                    <button onClick={() => handleDelete(img._id)} className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 dark:bg-gray-800/90 shadow-sm text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer"><Trash2 size={15} /></button>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        {showUpload && isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fadeIn" onClick={() => { setShowUpload(false); setPreview(null); setFile(null) }}>
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl w-full max-w-lg mx-4 p-6 shadow-2xl border border-gray-200 dark:border-white/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upload Image</h2>
                <button onClick={() => { setShowUpload(false); setPreview(null); setFile(null) }} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800 cursor-pointer"><X size={20} /></button>
              </div>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Image</label>
                  {preview ? (
                    <div className="relative rounded-xl overflow-hidden mb-2">
                      <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                      <button type="button" onClick={() => { setFile(null); setPreview(null) }} className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-sm text-gray-500 dark:text-gray-400 cursor-pointer"><X size={15} /></button>
                    </div>
                  ) : (
                    <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-[#6C5CE7] dark:hover:border-[#7C5CFF] transition-all">
                      <Upload size={28} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Click to select an image</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
                  <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Image title" className="w-full border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#6C5CE7] dark:focus:border-[#7C5CFF] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:bg-[#1E293B]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Event Name (optional)</label>
                  <input type="text" value={form.event_name} onChange={e => setForm(p => ({ ...p, event_name: e.target.value }))} placeholder="e.g. Freshers 2025" className="w-full border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#6C5CE7] dark:focus:border-[#7C5CFF] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:bg-[#1E293B]" />
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
