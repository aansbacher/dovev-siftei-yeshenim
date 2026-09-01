import { Link } from 'react-router-dom'
import { getHebrewDate } from '../../lib/hebrewDate'

export function Hero() {
  const { hebrewDateDisplay, parasha, gregorianDate, specialDays } = getHebrewDate(new Date())
  const formattedDate = gregorianDate.toLocaleDateString('he-IL', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <section className="relative overflow-hidden rounded-2xl bg-navy px-5 py-8 shadow-lg sm:px-8 sm:py-10" style={{ backgroundColor: '#1E2A38', color: '#F7F3EA' }}>
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/[0.03]" />
        <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/[0.03]" />
      </div>

      <div className="relative space-y-6">
        {/* Date area */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs text-cream/40">{formattedDate}</span>
            {specialDays.map((sd, i) => (
              <span key={i} className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30">
                {sd.label}
              </span>
            ))}
          </div>
          <p className="font-heading text-3xl font-black text-cream leading-none sm:text-4xl">
            {hebrewDateDisplay}
          </p>
          {parasha && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-gold">
              פרשת {parasha.replace('פרשת ', '')}
            </span>
          )}
        </div>

        {/* Copy */}
        <div>
          <h1 className="font-heading text-2xl font-black text-cream leading-snug sm:text-3xl">
            דובב שפתי ישנים
          </h1>
          <p className="mt-2 text-sm text-cream/60 leading-relaxed max-w-sm">
            סיפור אחד. וורט אחד. רגע של השראה מצדיקי ישראל, בכל יום.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <Link
            to="/today"
            className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy shadow-sm transition hover:bg-gold-light active:scale-95"
          >
            לגליון של היום
          </Link>
          <a
            href="#subscribe"
            className="inline-flex items-center justify-center rounded-full border border-cream/20 px-6 py-3 text-sm font-semibold text-cream/80 transition hover:border-cream/40 hover:text-cream active:scale-95"
          >
            הירשם לעדכונים
          </a>
        </div>
      </div>
    </section>
  )
}
