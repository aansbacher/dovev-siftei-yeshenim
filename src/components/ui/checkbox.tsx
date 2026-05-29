import type { ChangeEvent } from 'react'

interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      <span>{label}</span>
    </label>
  )
}
