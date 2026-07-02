import { useState, useEffect } from 'react'
import { Menu, Mail, Phone, BookOpen, Sun, Moon, Pencil, X, Check, Building2, Shield } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Dropdown from '../components/Dropdown'
import { useTheme } from '../context/ThemeContext'
import { getMe, updateProfile, getCollegeAdmin } from '../api'

const COURSES = ['BCA', 'BBA', 'BCOM', 'MBA', 'MCA', 'MCOM']
const SEMESTERS = ['1', '2', '3', '4', '5', '6']

export default function Profile() {
  const { dark, toggle } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})
  const [adminInfo, setAdminInfo] = useState(null)

  useEffect(() => {
    getMe().then(res => {
      setUser(res.user)
      setForm({
        name: res.user.name || '',
        phone: res.user.phone || '',
        department: res.user.department || '',
        course: res.user.course || '',
        enrollment: res.user.enrollment || '',
        semester: res.user.semester || '',
      })
      if (res.user.role === 'Student' && res.user.college_id) {
        getCollegeAdmin(res.user.college_id).then(r => setAdminInfo(r.admin)).catch(() => {})
      }
    }).catch(console.error)
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await updateProfile({
        name: form.name,
        phone: form.phone,
        department: form.department,
        course: form.course,
        enrollment: form.enrollment,
        semester: form.semester,
      })
      setUser(res.user)
      setForm(prev => ({
        ...prev,
        name: res.user.name || '',
        phone: res.user.phone || '',
        department: res.user.department || '',
        course: res.user.course || '',
        enrollment: res.user.enrollment || '',
        semester: res.user.semester || '',
      }))
      setEditing(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  function cancel() {
    setForm({
      name: user.name || '',
      phone: user.phone || '',
      department: user.department || '',
      course: user.course || '',
      enrollment: user.enrollment || '',
      semester: user.semester || '',
    })
    setEditing(false)
  }

  if (!user) {
    return (
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 lg:bg-fixed">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 ml-0 md:ml-64 flex items-center justify-center">
          <div className="text-gray-400 dark:text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  const isStudent = user.role === 'Student'

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 lg:bg-fixed overflow-x-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-4 px-6 md:px-8 h-16 bg-white/85 backdrop-blur-lg border-b border-gray-200 dark:bg-gray-900/85 dark:border-gray-700/50">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 cursor-pointer"><Menu size={22} /></button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">My Profile</h1>
          <button onClick={toggle} className="ml-auto p-2 rounded-lg text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer" aria-label="Toggle theme">
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-4xl w-full animate-fadeIn">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-6 md:p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-[#6C5CE7] dark:bg-[#7C5CFF] flex items-center justify-center text-white font-bold text-2xl">{user.name?.[0] || 'U'}</div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                <p className="text-sm text-gray-500 dark:text-[#94A3B8] mt-0.5">{user.role} · {user.email}</p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  {user.semester && <span className="flex items-center gap-1.5 text-xs font-medium text-[#6C5CE7] dark:text-[#7C5CFF] bg-[#EDE9FE] dark:bg-[rgba(124,92,255,0.15)] px-3 py-1 rounded-lg"><BookOpen size={13} /> {user.semester} Semester</span>}
                  <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-lg dark:text-gray-300 dark:bg-gray-800"><Mail size={13} /> {user.email}</span>
                  {user.phone && <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-lg dark:text-gray-300 dark:bg-gray-800"><Phone size={13} /> {user.phone}</span>}
                </div>
              </div>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-sm font-semibold bg-[#6C5CE7] text-white px-4 py-2 rounded-xl hover:bg-[#5B4BD6] dark:bg-[#7C5CFF] dark:hover:bg-[#6B4BEE] transition-all cursor-pointer shrink-0"><Pencil size={15} /> Edit Profile</button>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 text-sm font-semibold bg-[#10B981] text-white px-4 py-2 rounded-xl hover:bg-[#059669] transition-all cursor-pointer disabled:opacity-50"><Check size={15} /> {saving ? 'Saving...' : 'Save'}</button>
                  <button onClick={cancel} className="flex items-center gap-2 text-sm font-semibold bg-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-all cursor-pointer"><X size={15} /> Cancel</button>
                </div>
              )}
            </div>
          </div>

          {isStudent && (
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] dark:bg-[rgba(124,92,255,0.15)] flex items-center justify-center"><Building2 size={18} className="text-[#6C5CE7] dark:text-[#7C5CFF]" /></div>
                <h2 className="font-bold text-gray-900 dark:text-white">College &amp; Admin Details</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/30">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">College</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.college_name || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/30">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Admin</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{adminInfo?.name || 'N/A'}</p>
                  {adminInfo?.email && <a href={`mailto:${adminInfo.email}`} className="text-xs text-[#6C5CE7] dark:text-[#7C5CFF] hover:underline block mt-0.5">{adminInfo.email}</a>}
                  {adminInfo?.department && <p className="text-xs text-gray-500 dark:text-[#94A3B8] mt-0.5">{adminInfo.department}</p>}
                  {!adminInfo && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Loading...</p>}
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] dark:bg-[rgba(124,92,255,0.15)] flex items-center justify-center"><BookOpen size={18} className="text-[#6C5CE7] dark:text-[#7C5CFF]" /></div>
                <h2 className="font-bold text-gray-900 dark:text-white">{isStudent ? 'Academic Information' : 'Department Information'}</h2>
              </div>
              <div className="space-y-0">
                {isStudent ? (
                  <>
                    <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-[#94A3B8]">Course</span>
                      {editing ? (
                        <Dropdown value={form.course} onChange={val => setForm(p => ({ ...p, course: val }))} options={[{ value: '', label: 'Select' }, ...COURSES.map(c => ({ value: c, label: c }))]} className="w-32" />
                      ) : (
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{form.course || 'N/A'}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-[#94A3B8]">Enrollment No.</span>
                      {editing ? (
                        <input type="text" value={form.enrollment} onChange={e => setForm(p => ({ ...p, enrollment: e.target.value }))} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#6C5CE7] w-32 text-right" placeholder="e.g. 2024BCA001" />
                      ) : (
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{form.enrollment || 'N/A'}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-[#94A3B8]">Current Semester</span>
                      {editing ? (
                        <Dropdown value={form.semester} onChange={val => setForm(p => ({ ...p, semester: val }))} options={[{ value: '', label: 'Select' }, ...SEMESTERS.map(s => ({ value: s, label: s }))]} className="w-20" />
                      ) : (
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{form.semester ? `${form.semester} Semester` : 'N/A'}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm text-gray-500 dark:text-[#94A3B8]">Department</span>
                      {editing ? (
                        <input type="text" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#6C5CE7] w-32 text-right" placeholder="e.g. Computer Science" />
                      ) : (
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{form.department || 'N/A'}</span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-[#94A3B8]">Name</span>
                      {editing ? (
                        <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#6C5CE7] w-40 text-right" />
                      ) : (
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{form.name}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm text-gray-500 dark:text-[#94A3B8]">Department</span>
                      {editing ? (
                        <input type="text" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#6C5CE7] w-32 text-right" placeholder="e.g. Administration" />
                      ) : (
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{form.department || 'N/A'}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] dark:bg-[rgba(124,92,255,0.15)] flex items-center justify-center"><Mail size={18} className="text-[#6C5CE7] dark:text-[#7C5CFF]" /></div>
                <h2 className="font-bold text-gray-900 dark:text-white">Contact Information</h2>
              </div>
              <div className="space-y-0">
                <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800">
                  <span className="text-sm text-gray-500 dark:text-[#94A3B8]">Email</span>
                  <a href={`mailto:${user.email}`} className="text-sm font-semibold text-[#6C5CE7] dark:text-[#7C5CFF] hover:underline">{user.email}</a>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-500 dark:text-[#94A3B8]">Phone</span>
                  {editing ? (
                    <input type="text" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[#6C5CE7] w-32 text-right" placeholder="e.g. +91 9876543210" />
                  ) : (
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{user.phone || 'Not provided'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
