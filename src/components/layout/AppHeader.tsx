import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useI18n } from '../../lib/i18n'

function LangToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useI18n()
  return (
    <div className={`inline-flex items-center rounded-full border border-rule bg-surface-2 p-0.5 text-[12px] font-bold ${className}`}>
      <button
        onClick={() => setLang('he')}
        className={`px-2.5 py-1 rounded-full transition ${lang === 'he' ? 'bg-gold text-white' : 'text-ink-soft'}`}
        aria-pressed={lang === 'he'}
      >עב</button>
      <button
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 rounded-full transition ${lang === 'en' ? 'bg-gold text-white' : 'text-ink-soft'}`}
        aria-pressed={lang === 'en'}
      >EN</button>
    </div>
  )
}

export function AppHeader() {
  const [open, setOpen] = useState(false)
  const { t } = useI18n()

  const NAV_ITEMS = [
    { to: '/', label: t.nav_home },
    { to: '/today', label: t.nav_today },
    { to: '/about', label: t.nav_about },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-md border-b border-rule">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <Link
            to="/"
            className="font-display text-lg font-bold text-ink leading-tight"
            style={{ letterSpacing: '-0.01em' }}
          >
            {t.brand}
          </Link>

          <div className="flex items-center gap-2">
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="px-3 py-1.5 text-sm font-medium text-ink-soft hover:text-gold rounded-lg hover:bg-accent-soft transition"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <LangToggle />

            {/* Hamburger */}
            <button
              onClick={() => setOpen(true)}
              className="md:hidden p-2 text-ink-soft hover:text-gold transition"
              aria-label={t.openMenu}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${open ? 'visible' : 'invisible'}`}
      >
        <div
          className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute inset-y-0 end-0 w-72 bg-surface flex flex-col shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'rtl:translate-x-full ltr:-translate-x-full'}`}
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-6 border-b border-rule">
            <span className="font-display text-lg font-bold text-ink">{t.brand}</span>
            <button
              onClick={() => setOpen(false)}
              className="p-2 text-muted hover:text-ink transition"
              aria-label={t.closeMenu}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col px-3 py-4 gap-1">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="px-4 py-3.5 text-base font-medium text-ink-soft hover:text-gold hover:bg-accent-soft rounded-xl transition"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto px-5 pb-8 pt-4 border-t border-rule">
            <p className="text-xs text-muted leading-relaxed">{t.menuFooter}</p>
          </div>
        </div>
      </div>
    </>
  )
}
