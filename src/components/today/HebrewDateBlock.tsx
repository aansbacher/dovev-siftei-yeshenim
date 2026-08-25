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

      <div className="mt-3 sm:mt-6">
        <div className="text-[10px] sm:text-[11px] tracking-[3px] font-bold text-gold mb-1.5">בְּעֲלֵי הַהִילּוּלָא שֶׁל הַיּוֹם</div>
        <h1 className="font-display font-black text-ink leading-none text-[34px] sm:text-6xl text-balance">
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
            <span>{parasha.startsWith('פרשת') ? parasha : `פרשת ${parasha}`}</span>
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
        {totalTzaddikim > 0 && (
          <>
            <i className="w-1 h-1 rounded-full bg-gold/70" />
            <span className="text-muted">{totalTzaddikim} בעלי הילולא</span>
          </>
        )}
      </div>
    </section>
  )
}
