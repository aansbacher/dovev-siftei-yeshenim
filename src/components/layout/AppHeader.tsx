import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export function AppHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-slate-100">
          <Sparkles className="h-6 w-6 text-indigo-600" />
          דובב שפתי ישנים
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link to="/today" className="rounded-full px-3 py-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">
            קדושים בכל יום
          </Link>
        </nav>
      </div>
    </header>
  )
}
