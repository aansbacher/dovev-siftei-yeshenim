import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, Search } from 'lucide-react'

/** Mobile bottom tab bar with an elevated center button (מזמור-יומי style). */
export function BottomNav() {
  const { pathname } = useLocation()
  const side = [
    { to: '/', label: 'בית', icon: Home },
    { to: '/search', label: 'חיפוש', icon: Search },
  ]
  const isToday = pathname === '/today'

  return (
    <nav
      dir="rtl"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-rule"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="relative max-w-lg mx-auto grid grid-cols-3 items-end h-16 px-6">
        {/* right side item */}
        <NavItem {...side[0]} active={pathname === side[0].to} />

        {/* elevated center = today's issue */}
        <div className="flex justify-center">
          <Link
            to="/today"
            aria-label="גיליון היום"
            className={`-mt-7 w-16 h-16 rounded-full flex flex-col items-center justify-center gap-0.5 shadow-[0_8px_20px_-4px_rgba(91,118,229,.55)] transition
              ${isToday ? 'bg-gold-deep' : 'bg-gold'} text-white`}
          >
            <BookOpen className="w-6 h-6" />
            <span className="text-[10px] font-semibold">היום</span>
          </Link>
        </div>

        {/* left side item */}
        <NavItem {...side[1]} active={pathname === side[1].to} />
      </div>
    </nav>
  )
}

function NavItem({ to, label, icon: Icon, active }: { to: string; label: string; icon: any; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center gap-1 h-full transition ${active ? 'text-gold' : 'text-muted hover:text-ink-soft'}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[11px] font-medium">{label}</span>
    </Link>
  )
}
