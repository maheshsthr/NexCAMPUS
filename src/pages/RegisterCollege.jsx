import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2, Building2, Hash } from 'lucide-react'
import { registerCollege } from '../api'

export default function RegisterCollege() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', code: '', address: '',
    adminName: '', adminEmail: '', adminPassword: '', confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (submitError) setSubmitError('')
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'College name is required'
    if (!form.code.trim()) errs.code = 'College code is required'
    if (!form.adminName.trim()) errs.adminName = 'Admin name is required'
    if (!form.adminEmail) errs.adminEmail = 'Admin email is required'
    else if (!/\S+@\S+\.\S+/.test(form.adminEmail)) errs.adminEmail = 'Enter a valid email'
    if (!form.adminPassword) errs.adminPassword = 'Password is required'
    else if (form.adminPassword.length < 6) errs.adminPassword = 'Min 6 characters'
    if (form.adminPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setLoading(true)
    setSubmitError('')
    try {
      const data = await registerCollege({
        name: form.name.trim(),
        code: form.code.trim(),
        address: form.address,
        adminName: form.adminName.trim(),
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
      })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/dashboard')
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="hidden lg:flex w-1/2 bg-[#6C5CE7] dark:bg-[#7C5CFF] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 400 300" className="w-full h-full"><circle cx="200" cy="160" r="120" fill="white" /><rect x="80" y="100" width="60" height="80" rx="6" fill="white" /><rect x="85" y="105" width="50" height="8" rx="2" fill="white" opacity="0.7" /><rect x="85" y="118" width="50" height="8" rx="2" fill="white" opacity="0.7" /><rect x="85" y="131" width="50" height="8" rx="2" fill="white" opacity="0.7" /><rect x="260" y="80" width="60" height="100" rx="6" fill="white" /><rect x="265" y="85" width="50" height="8" rx="2" fill="white" opacity="0.7" /><rect x="265" y="98" width="50" height="8" rx="2" fill="white" opacity="0.7" /><rect x="265" y="111" width="50" height="8" rx="2" fill="white" opacity="0.7" /></svg>
        </div>
        <div className="relative z-10 text-center text-white">
          <Link to="/" className="inline-flex items-center gap-2.5 text-white text-xl font-bold mb-8">
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="white" /><path d="M8 22V12L16 6L24 12V22H20V16L16 20L12 16V22H8Z" fill="#6C5CE7" /></svg>
            <span>Campus<span className="text-[#EDE9FE]">360</span></span>
          </Link>
          <h1 className="text-3xl font-extrabold mb-3">Register Your College</h1>
          <p className="text-[#EDE9FE] max-w-sm mx-auto">Create a college account to manage notices, events, and students.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 dark:bg-[#0F172A]">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">College Registration</h2>
          <p className="text-sm text-gray-500 dark:text-[#94A3B8] mb-6">Enter college details and admin information.</p>

          {submitError && (
            <div className="flex items-center gap-2.5 bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-5">
              <AlertCircle size={18} /> <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-[#EDE9FE] dark:bg-[rgba(124,92,255,0.1)] rounded-xl">
              <p className="text-xs font-semibold text-[#6C5CE7] dark:text-[#7C5CFF] mb-2">College Details</p>
              <div className="space-y-3">
                <div className={`flex items-center gap-3 bg-white dark:bg-gray-800 border rounded-xl px-3.5 ${errors.name ? 'border-red-400' : 'border-gray-200 dark:border-white/10'}`}>
                  <Building2 size={18} className="text-gray-400 shrink-0" />
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="College Name" className="flex-1 bg-transparent border-none outline-none py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400" />
                </div>
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                <div className={`flex items-center gap-3 bg-white dark:bg-gray-800 border rounded-xl px-3.5 ${errors.code ? 'border-red-400' : 'border-gray-200 dark:border-white/10'}`}>
                  <Hash size={18} className="text-gray-400 shrink-0" />
                  <input type="text" name="code" value={form.code} onChange={handleChange} placeholder="College Code (e.g. ABC123)" className="flex-1 bg-transparent border-none outline-none py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400" />
                </div>
                {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl px-3.5">
                  <Building2 size={18} className="text-gray-400 shrink-0" />
                  <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Address (optional)" className="flex-1 bg-transparent border-none outline-none py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400" />
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#EDE9FE] dark:bg-[rgba(124,92,255,0.1)] rounded-xl">
              <p className="text-xs font-semibold text-[#6C5CE7] dark:text-[#7C5CFF] mb-2">Admin Account</p>
              <div className="space-y-3">
                <div className={`flex items-center gap-3 bg-white dark:bg-gray-800 border rounded-xl px-3.5 ${errors.adminName ? 'border-red-400' : 'border-gray-200 dark:border-white/10'}`}>
                  <User size={18} className="text-gray-400 shrink-0" />
                  <input type="text" name="adminName" value={form.adminName} onChange={handleChange} placeholder="Admin Name" className="flex-1 bg-transparent border-none outline-none py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400" />
                </div>
                {errors.adminName && <p className="text-xs text-red-500">{errors.adminName}</p>}
                <div className={`flex items-center gap-3 bg-white dark:bg-gray-800 border rounded-xl px-3.5 ${errors.adminEmail ? 'border-red-400' : 'border-gray-200 dark:border-white/10'}`}>
                  <Mail size={18} className="text-gray-400 shrink-0" />
                  <input type="email" name="adminEmail" value={form.adminEmail} onChange={handleChange} placeholder="Admin Email" className="flex-1 bg-transparent border-none outline-none py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400" />
                </div>
                {errors.adminEmail && <p className="text-xs text-red-500">{errors.adminEmail}</p>}
                <div className={`flex items-center gap-3 bg-white dark:bg-gray-800 border rounded-xl px-3.5 ${errors.adminPassword ? 'border-red-400' : 'border-gray-200 dark:border-white/10'}`}>
                  <Lock size={18} className="text-gray-400 shrink-0" />
                  <input type={showPw ? 'text' : 'password'} name="adminPassword" value={form.adminPassword} onChange={handleChange} placeholder="Password (min 6 chars)" className="flex-1 bg-transparent border-none outline-none py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.adminPassword && <p className="text-xs text-red-500">{errors.adminPassword}</p>}
                <div className={`flex items-center gap-3 bg-white dark:bg-gray-800 border rounded-xl px-3.5 ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200 dark:border-white/10'}`}>
                  <Lock size={18} className="text-gray-400 shrink-0" />
                  <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" className="flex-1 bg-transparent border-none outline-none py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400" />
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#6C5CE7] text-white py-3 rounded-xl font-semibold hover:bg-[#5B4BD6] dark:bg-[#7C5CFF] dark:hover:bg-[#6B4BEE] transition-all disabled:opacity-70 cursor-pointer">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Registering...</> : <><CheckCircle2 size={18} /> Register College</>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-[#94A3B8] mt-4">Already have a college account? <Link to="/login" className="text-[#6C5CE7] dark:text-[#7C5CFF] font-medium hover:underline">Sign In</Link></p>
        </div>
      </div>
    </div>
  )
}
