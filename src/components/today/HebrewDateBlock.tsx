import type { SpecialDay } from '../../lib/hebrewDate'

interface HebrewDateBlockProps {
  hebrewDateDisplay: string
  parasha: string
  gregorianDate: Date
  totalTzaddikim: number
  specialDays?: SpecialDay[]
}

export function HebrewDateBlock({
  hebrewDateDisplay,
  parasha,
  gregorianDate,
  totalTzaddikim,
  specialDays = [],
}: HebrewDateBlockProps) {
  const formattedGregorian = gregorianDate.toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <section className="text-center pt-1 pb-1">
      <div className="dsy-dbl" />

      <div className="relative mt-3 sm:mt-6">
        {/* warm halo directly behind the hero date */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[150px] sm:w-[380px] sm:h-[190px] rounded-full"
          style={{ background: 'radial-gradient(closest-side, rgba(217,162,78,.22), rgba(217,162,78,0) 72%)' }}
        />
        <div className="relative inline-flex items-center gap-2 text-[10px] sm:text-[11px] tracking-[3px] font-bold text-warm-deep mb-2.5">
          <span className="h-px w-4 bg-warm/50" />
          בְּעֲלֵי הַהִילּוּלָא שֶׁל הַיּוֹם
          <span className="h-px w-4 bg-warm/50" />
        </div>
        <h1
          className="relative font-display font-black text-ink leading-none text-[40px] sm:text-[68px] text-balance"
          style={{ textShadow: '0 2px 14px rgba(217,162,78,.18)' }}
        >
          {hebrewDateDisplay}
        </h1>
      </div>

      <div className="dsy-flourish my-3 sm:my-5" aria-hidden="true">
        <span className="l" />
        <svg viewBox="0 0 68 20"><path d="M2 10H27M41 10H66" strokeWidth="1.1" /><path d="M34 3 L39.5 10 L34 17 L28.5 10 Z" /><circle cx="34" cy="10" r="2" fill="var(--ground)" /></svg>
        <span className="l" />
      </div>

      <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-[13px] text-ink-soft">
        <span>{formattedGregorian}</span>
        {parasha && (
          <>
            <i className="w-1 h-1 rounded-full bg-gold/70" />
            <span>{`פרשת ${parasha.replace(/^פ[֑-ׇ]*ר[֑-ׇ]*ש[֑-ׇ]*ת[֑-ׇ]*\s+/, '')}`}</span>
          </>
        )}
        {specialDays.map((sd, i) => (
          <span
            key={i}
            className="text-xs font-semibold px-3 py-0.5 rounded-full border border-[color:var(--line)] text-gold-deep bg-surface-2"
          >
            {sd.label}
          </span>
        ))}
      </div>

      {totalTzaddikim > 0 && (
        <div className="mt-3 flex justify-center">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-warm-deep bg-warm-soft border border-[color:var(--warm-line)] rounded-full px-3.5 py-1">
            <i className="w-1.5 h-1.5 rounded-full bg-warm" />
            {totalTzaddikim} בעלי הילולא היום
          </span>
        </div>
      )}
    </section>
  )
}
