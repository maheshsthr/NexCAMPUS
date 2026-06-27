import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export default function Dropdown({ value, onChange, options, placeholder, className, error }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selected = options.find(o => o.value === value)

  return (
    <div ref={ref} className={`relative ${className || ''}`}>
      <button type="button" onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 w-full border ${error ? 'border-red-400' : 'border-gray-200 dark:border-white/10'} rounded-xl px-3.5 py-2.5 text-sm text-left bg-white dark:bg-[#1E293B] hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer`}>
        <span className={`flex-1 ${selected ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
          {selected ? selected.label : placeholder || 'Select'}
        </span>
        <ChevronDown size={14} className={`text-gray-400 dark:text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden animate-fadeIn">
          {options.map(opt => (
            <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors cursor-pointer ${value === opt.value ? 'bg-[#EDE9FE] dark:bg-[rgba(124,92,255,0.15)] text-[#6C5CE7] dark:text-[#7C5CFF] font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
