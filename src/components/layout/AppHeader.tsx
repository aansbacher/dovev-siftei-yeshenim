import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',         label: 'דף הבית' },
  { to: '/today',    label: 'קדושים בכל יום' },
  { to: '/subscribe',label: 'הירשם לעדכונים' },
  { to: '/about',    label: 'אודות' },
]

export function AppHeader() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 bg-navy border-b border-navy-light/40 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <Link
            to="/"
            className="font-heading text-base font-bold text-cream leading-tight"
            style={{ letterSpacing: '-0.01em' }}
          >
            דובב שפתי ישנים
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="px-3 py-1.5 text-sm font-medium text-cream/70 hover:text-cream rounded-lg hover:bg-white/5 transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden p-2 -mr-1 text-cream/80 hover:text-cream transition"
            aria-label="פתח תפריט"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${open ? 'visible' : 'invisible'}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setOpen(false)}
        />
        {/* Panel */}
        <div
          className={`absolute inset-y-0 right-0 w-72 bg-navy flex flex-col shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-6 border-b border-cream/10">
            <span className="font-heading text-base font-bold text-cream">דובב שפתי ישנים</span>
            <button
              onClick={() => setOpen(false)}
              className="p-2 text-cream/60 hover:text-cream transition"
              aria-label="סגור תפריט"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col px-3 py-4 gap-1">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="px-4 py-3.5 text-base font-medium text-cream/80 hover:text-cream hover:bg-white/5 rounded-xl transition"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto px-5 pb-8 pt-4 border-t border-cream/10">
            <p className="text-xs text-cream/30 leading-relaxed">
              זכר צדיקים לברכה
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
