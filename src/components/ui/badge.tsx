import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
}

export function Badge({ children }: BadgeProps) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
      {children}
    </span>
  )
}
