import type { SpecialDay } from '../../lib/hebrewDate'
import { useI18n, hebDateEn } from '../../lib/i18n'

interface HebrewDateBlockProps {
  hebrewDateDisplay: string
  hebrewDay?: number
  hebrewMonth?: string
  parasha: string
  gregorianDate: Date
  totalTzaddikim: number
  specialDays?: SpecialDay[]
}

export function HebrewDateBlock({
  hebrewDateDisplay,
  hebrewDay,
  hebrewMonth,
  parasha,
  gregorianDate,
  totalTzaddikim,
  specialDays = [],
}: HebrewDateBlockProps) {
  const { lang, t } = useI18n()
  const formattedGregorian = gregorianDate.toLocaleDateString(lang === 'en' ? 'en-US' : 'he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const heroDate = lang === 'en' ? hebDateEn(hebrewDay, hebrewMonth) : hebrewDateDisplay

  return (
    <section className="text-center pt-1 pb-1">
      <div className="dsy-dbl" />

      <div className="relative mt-1 sm:mt-1.5">
        {/* warm halo directly behind the hero date */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[100px] sm:w-[300px] sm:h-[130px] rounded-full"
          style={{ background: 'radial-gradient(closest-side, rgba(217,162,78,.20), rgba(217,162,78,0) 72%)' }}
        />
        <h1
          className="relative font-display font-black text-ink leading-none text-[29px] sm:text-[42px] text-balance"
          style={{ textShadow: '0 2px 14px rgba(217,162,78,.18)' }}
        >
          {heroDate}
        </h1>
      </div>

      <div className="dsy-flourish my-2 sm:my-2.5" aria-hidden="true">
        <span className="l" />
        <svg viewBox="0 0 68 20"><path d="M2 10H27M41 10H66" strokeWidth="1.1" /><path d="M34 3 L39.5 10 L34 17 L28.5 10 Z" /><circle cx="34" cy="10" r="2" fill="var(--ground)" /></svg>
        <span className="l" />
      </div>

      <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-[13px] text-ink-soft">
        <span>{formattedGregorian}</span>
        {parasha && (
          <>
            <i className="w-1 h-1 rounded-full bg-gold/70" />
            <span>{t.parsha(parasha.replace(/^פ[֑-ׇ]*ר[֑-ׇ]*ש[֑-ׇ]*ת[֑-ׇ]*\s+/, '').replace(/[֑-ׇ]/g, ''))}</span>
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
        <div className="mt-2.5 flex justify-center">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-warm-deep bg-warm-soft border border-[color:var(--warm-line)] rounded-full px-3.5 py-1">
            <i className="w-1.5 h-1.5 rounded-full bg-warm" />
            {totalTzaddikim === 1 ? t.oneToday : t.nToday(totalTzaddikim)}
          </span>
        </div>
      )}
    </section>
  )
}
