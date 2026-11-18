import { HDate, gematriya } from '@hebcal/core'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { getHebrewDate } from '../../lib/hebrewDate'
import { useI18n, hebMonthEn } from '../../lib/i18n'

interface HebrewCalendarProps {
  date: Date
  onChange: (date: Date) => void
}

function moveHebrewMonth(date: Date, delta: number): Date {
  const hd = new HDate(date)
  let month = hd.getMonth() + delta
  let year = hd.getFullYear()
  if (month < 1) { year -= 1; month = HDate.monthsInYear(year) }
  else if (month > HDate.monthsInYear(year)) { year += 1; month = 1 }
  const days = HDate.daysInMonth(month, year)
  const day = Math.min(hd.getDate(), days)
  return new HDate(day, month, year).greg()
}

export function HebrewCalendar({ date, onChange }: HebrewCalendarProps) {
  const { t, lang, dir } = useI18n()
  const en = lang === 'en'
  const PrevIcon = en ? ChevronLeft : ChevronRight
  const NextIcon = en ? ChevronRight : ChevronLeft
  const hd = new HDate(date)
  const month = hd.getMonth()
  const year = hd.getFullYear()
  const days = HDate.daysInMonth(month, year)
  const selDay = hd.getDate()
  const firstGreg = new HDate(1, month, year).greg()
  const lastGreg = new HDate(days, month, year).greg()
  const lead = firstGreg.getDay() // 0=Sun .. 6=Sat

  const hebMonthNameHe = getHebrewDate(firstGreg).hebrewMonth
  const hebMonthName = en ? hebMonthEn(hebMonthNameHe) : hebMonthNameHe
  const gregShort = (d: Date) => d.toLocaleDateString(en ? 'en-US' : 'he-IL', { month: 'short' })
  const gregRange = gregShort(firstGreg) === gregShort(lastGreg)
    ? gregShort(firstGreg)
    : `${gregShort(firstGreg)}–${gregShort(lastGreg)}`
  const yearLabel = en ? String(year) : gematriya(year % 1000)

  const cells: React.ReactNode[] = []
  for (let i = 0; i < lead; i++) cells.push(<span key={`b${i}`} className="dsy-cd blank" />)
  for (let d = 1; d <= days; d++) {
    const greg = new HDate(d, month, year).greg()
    const on = d === selDay
    cells.push(
      <button
        key={d}
        type="button"
        onClick={() => onChange(greg)}
        className={`dsy-cd${on ? ' on' : ''}`}
        aria-label={`${d} ${hebMonthName}`}
      >
        <b>{en ? d : gematriya(d)}</b>
        <i>{greg.getDate()}</i>
      </button>
    )
  }

  return (
    <div className="bg-surface border border-rule rounded-md p-3 mt-3.5" dir={dir}>
      <div className="flex items-center justify-between mb-2.5">
        <button type="button" onClick={() => onChange(moveHebrewMonth(date, -1))} className="p-1 text-gold" aria-label={t.cal_prevMonth}>
          <PrevIcon className="w-4 h-4" />
        </button>
        <span className="font-display font-bold text-sm text-ink text-center">
          {hebMonthName} {yearLabel} · {gregRange} {firstGreg.getFullYear()}
        </span>
        <button type="button" onClick={() => onChange(moveHebrewMonth(date, 1))} className="p-1 text-gold" aria-label={t.cal_nextMonth}>
          <NextIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="dsy-calgrid mb-1">
        {t.cal_dow.map((d, i) => <span key={i} className="dsy-dw">{d}</span>)}
      </div>
      <div className="dsy-calgrid">{cells}</div>
    </div>
  )
}
