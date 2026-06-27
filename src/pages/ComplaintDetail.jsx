import { useLocation, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Eye, Ban, MessageSquare } from 'lucide-react'

const STATUS_MAP = {
  'pending': { label: 'Pending', badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', dotClass: 'bg-gray-500' },
  'in-progress': { label: 'In Progress', badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400', dotClass: 'bg-blue-500' },
  'under-review': { label: 'Under Review', badgeClass: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400', dotClass: 'bg-yellow-500' },
  'resolved': { label: 'Resolved', badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400', dotClass: 'bg-emerald-500' },
  'rejected': { label: 'Rejected', badgeClass: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400', dotClass: 'bg-red-500' },
}

export default function ComplaintDetail() {
  const { id } = useParams()
  const { state } = useLocation()
  const complaint = state?.complaint
  const user = state?.user || JSON.parse(localStorage.getItem('user') || '{}')

  if (!complaint) {
    return (
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 lg:bg-fixed overflow-x-hidden items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-medium text-gray-500">Complaint not found.</p>
          <Link to="/dashboard/complaints" className="text-[#6C5CE7] text-sm mt-2 inline-block hover:underline">Back to Complaints</Link>
        </div>
      </div>
    )
  }

  const s = STATUS_MAP[complaint.status] || STATUS_MAP['pending']
  const StatusIcon = complaint.status === 'resolved' ? CheckCircle2 : complaint.status === 'rejected' ? Ban : complaint.status === 'in-progress' ? Clock : complaint.status === 'under-review' ? Eye : AlertCircle

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 lg:bg-fixed overflow-x-hidden">
      <div className="flex-1 max-w-4xl mx-auto p-6 md:p-8 w-full animate-fadeIn">
        <div className="mb-6">
          <Link to="/dashboard/complaints" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-[#94A3B8] hover:text-gray-700 dark:hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Complaints
          </Link>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">#{complaint._id ? String(complaint._id).slice(-5) : complaint.id}</span>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg ${s.badgeClass}`}>
                  <StatusIcon size={11} />
                  {s.label}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-1">{complaint.title}</h1>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Category</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{complaint.category}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Submitted By</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{complaint.created_by?.name || user.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Submitted On</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{new Date(complaint.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Last Updated</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{new Date(complaint.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{complaint.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
