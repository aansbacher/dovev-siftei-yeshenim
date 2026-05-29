import type { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from 'react'

interface ButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md'
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-full font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500/30'
  const variants = {
    primary: 'bg-accent text-white hover:bg-indigo-500',
    secondary: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
  }
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
  }

  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
}
