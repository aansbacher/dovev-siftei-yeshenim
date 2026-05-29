import type { InputHTMLAttributes, DetailedHTMLProps } from 'react'

interface InputProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-300">
      <span>{label}</span>
      <input
        className={`rounded-full border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-rose-500">{error}</span> : null}
    </label>
  )
}
