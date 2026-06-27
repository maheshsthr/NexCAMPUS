import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CalendarDays, MessageSquareWarning, BookOpen, AlertCircle, Menu, FileText, Search, Clock, Sun, Moon } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import { useTheme } from '../context/ThemeContext'
import { getDashboard, getStudyMaterials } from '../api'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const categoryStyles = {
  Academic: 'bg-[#EDE9FE] text-[#6C5CE7] ring-1 ring-[#6C5CE7]/30 dark:bg-[rgba(124,92,255,0.15)] dark:text-[#7C5CFF] dark:ring-[#7C5CFF]/30',
  Library: 'bg-green-50 text-green-600 ring-1 ring-green-200/50 dark:bg-green-950/40 dark:text-green-400 dark:ring-green-800/30',
  Facility: 'bg-orange-50 text-orange-600 ring-1 ring-orange-200/50 dark:bg-orange-950/40 dark:text-orange-400 dark:ring-orange-800/30',
  Events: 'bg-[#EDE9FE] text-[#6C5CE7] ring-1 ring-[#6C5CE7]/30 dark:bg-[rgba(124,92,255,0.15)] dark:text-[#7C5CFF] dark:ring-[#7C5CFF]/30',
}

export default function Dashboard() {
  const { dark, toggle } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [data, setData] = useState(null)
  const [studyCount, setStudyCount] = useState(0)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    getDashboard().then(setData).catch(console.error)
    getStudyMaterials({ limit: 1 }).then(res => setStudyCount(res.total)).catch(() => {})
  }, [])

  if (!data) {
    return (
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  const { stats, recentNotices, upcomingEvents } = data
  const total = stats.totalComplaints || 1

  const STATS = {
    totalNotices: { value: stats.totalNotices, label: 'Total Notices', change: 'Latest updates', barClass: 'bg-[#6C5CE7]', iconClass: 'bg-[#6C5CE7]', icon: Bell },
    upcomingEvents: { value: stats.upcomingEvents, label: 'Upcoming Events', change: 'Coming up', barClass: 'bg-[#00D4FF]', iconClass: 'bg-[#00D4FF]', icon: CalendarDays },
    pendingComplaints: { value: stats.pendingComplaints, label: 'Pending Complaints', change: `${stats.inProgressComplaints} in progress`, barClass: 'bg-[#DC2626]', iconClass: 'bg-[#DC2626]', icon: MessageSquareWarning },
    studyMaterials: { value: studyCount, label: 'Study Materials', change: 'Available', barClass: 'bg-[#10B981]', iconClass: 'bg-[#10B981]', icon: BookOpen },
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 lg:bg-fixed overflow-x-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 flex items-center gap-4 px-6 md:px-8 h-16 bg-white/85 backdrop-blur-lg border-b border-gray-200 dark:bg-gray-900/85 dark:border-gray-700/50">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 cursor-pointer" aria-label="Menu">
            <Menu size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Welcome Back, {user.name}</h1>
          </div>
          <button onClick={toggle} className="p-2 rounded-lg text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer" aria-label="Toggle theme">
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => navigate('/dashboard/profile')} className="flex items-center gap-2.5 pl-1 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-[#6C5CE7] dark:bg-[#7C5CFF] flex items-center justify-center text-white font-bold text-sm">{user.name?.[0] || 'U'}</div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{user.name}</p>
              <p className="text-[11px] text-gray-500 dark:text-[#94A3B8]">{user.college_name || user.role}</p>
            </div>
          </button>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full animate-fadeIn">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
            {Object.entries(STATS).map(([key, s]) => <StatCard key={key} {...s} />)}
          </div>

          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-gray-900 dark:text-white">Recent Notices</h3>
                  <button onClick={() => navigate('/dashboard/notices-events')} className="text-xs font-semibold text-[#6C5CE7] dark:text-[#7C5CFF] hover:bg-[#EDE9FE] dark:hover:bg-[rgba(124,92,255,0.15)] transition-all px-3 py-1.5 rounded-lg cursor-pointer">View All</button>
                </div>
                <div className="space-y-0">
                  {recentNotices.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500">No notices yet.</p>
                  ) : recentNotices.map(n => (
                    <div key={n._id} className="flex items-start gap-4 py-3.5 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0 first:pt-0">
                      <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] dark:bg-[rgba(124,92,255,0.15)] flex items-center justify-center shrink-0">
                        <FileText size={16} className="text-[#6C5CE7] dark:text-[#7C5CFF]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">{n.title}</span>
                        <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-[#94A3B8]">
                          <span>{formatDate(n.createdAt)}</span>
                          {n.category && <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${categoryStyles[n.category] || 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>{n.category}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-gray-900 dark:text-white">Complaint Status</h3>
                  <button onClick={() => navigate('/dashboard/complaints')} className="text-xs font-semibold text-[#6C5CE7] dark:text-[#7C5CFF] hover:bg-[#EDE9FE] dark:hover:bg-[rgba(124,92,255,0.15)] transition-all px-3 py-1.5 rounded-lg cursor-pointer">View All</button>
                </div>
                <div className="space-y-5">
                  <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200/50 dark:bg-gray-800 dark:ring-gray-700/50">
                    <div className="h-full bg-amber-500 transition-all duration-700" style={{ width: `${(stats.pendingComplaints / total) * 100}%` }} />
                    <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${(stats.inProgressComplaints / total) * 100}%` }} />
                    <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${(stats.resolvedComplaints / total) * 100}%` }} />
                  </div>
                  <div className="flex gap-6 text-xs">
                    {[
                      { label: 'Pending', value: stats.pendingComplaints, bgClass: 'bg-amber-50 dark:bg-amber-950/40', icon: Clock, iconClass: 'text-amber-500 dark:text-amber-400' },
                      { label: 'In Progress', value: stats.inProgressComplaints, bgClass: 'bg-blue-50 dark:bg-blue-950/40', icon: AlertCircle, iconClass: 'text-blue-500 dark:text-blue-400' },
                      { label: 'Resolved', value: stats.resolvedComplaints, bgClass: 'bg-emerald-50 dark:bg-emerald-950/40', icon: Bell, iconClass: 'text-emerald-500 dark:text-emerald-400' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bgClass}`}>
                          <item.icon size={14} className={item.iconClass} />
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-[#94A3B8]">{item.label}</span>
                          <span className="font-bold text-gray-900 dark:text-white ml-1">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-gray-900 dark:text-white">Upcoming Events</h3>
                  <button onClick={() => navigate('/dashboard/notices-events')} className="text-xs font-semibold text-[#6C5CE7] dark:text-[#7C5CFF] hover:bg-[#EDE9FE] dark:hover:bg-[rgba(124,92,255,0.15)] transition-all px-3 py-1.5 rounded-lg cursor-pointer">View All</button>
                </div>
                <div className="space-y-0">
                  {upcomingEvents.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500">No upcoming events.</p>
                  ) : upcomingEvents.map(e => (
                    <div key={e._id} className="flex items-center gap-4 py-3.5 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0 first:pt-0">
                      <div className="flex flex-col items-center w-14 py-2.5 bg-[#EDE9FE] dark:bg-[rgba(124,92,255,0.15)] rounded-xl shrink-0 ring-1 ring-[#6C5CE7]/30 dark:ring-[#7C5CFF]/30">
                        <span className="text-[10px] font-bold text-[#6C5CE7] dark:text-[#7C5CFF] uppercase leading-none">{new Date(e.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight mt-0.5">{new Date(e.date).getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{e.title}</span>
                        <span className="text-xs text-gray-500 dark:text-[#94A3B8] flex items-center gap-1">
                          <CalendarDays size={11} />
                          {e.venue} · {e.time || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
