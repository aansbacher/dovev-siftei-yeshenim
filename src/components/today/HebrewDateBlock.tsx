import type { SpecialDay } from '../../lib/hebrewDate'

interface HebrewDateBlockProps {
  hebrewDateDisplay: string
  parasha: string
  gregorianDate: Date
  totalTzaddikim: number
  specialDays?: SpecialDay[]
}

const specialDayColors: Record<string, string> = {
  holiday:     'bg-gold/20 text-gold border border-gold/30',
  fast:        'bg-cream/10 text-cream/70 border border-cream/20',
  roshchodesh: 'bg-gold/25 text-gold border border-gold/40',
  omer:        'bg-cream/10 text-cream/60 border border-cream/20',
  special:     'bg-cream/10 text-cream/60 border border-cream/20',
}

export function HebrewDateBlock({
  hebrewDateDisplay,
  parasha,
  gregorianDate,
  totalTzaddikim,
  specialDays = [],
}: HebrewDateBlockProps) {
  const formattedGregorian = gregorianDate.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <section className="relative overflow-hidden rounded-2xl bg-navy px-5 pt-5 pb-6 shadow-lg" style={{ backgroundColor: '#1E2A38', color: '#F7F3EA' }}>
      {/* Subtle decorative element */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden rounded-2xl">
        <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-white/[0.03]" />
        <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-white/[0.03]" />
      </div>

      <div className="relative">
        {/* Gregorian + special day badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs text-cream/40">{formattedGregorian}</span>
          {specialDays.map((sd, i) => (
            <span
              key={i}
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${specialDayColors[sd.type] ?? 'bg-cream/10 text-cream/60 border border-cream/20'}`}
            >
              {sd.label}
            </span>
          ))}
        </div>

        {/* Hebrew date */}
        <h1 className="font-heading text-4xl font-black text-cream leading-none sm:text-5xl">
          {hebrewDateDisplay}
        </h1>

        {/* Parasha + tzaddikim count */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {parasha && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-gold">
              <span className="opacity-70">פרשת</span>
              {parasha.replace('פרשת ', '')}
            </span>
          )}
          {totalTzaddikim > 0 && (
            <span className="text-xs text-cream/30">
              {totalTzaddikim} בעלי הילולא
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
