import { HDate, gematriya } from '@hebcal/core'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { getHebrewDate } from '../../lib/hebrewDate'

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

const DOW = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']

export function HebrewCalendar({ date, onChange }: HebrewCalendarProps) {
  const hd = new HDate(date)
  const month = hd.getMonth()
  const year = hd.getFullYear()
  const days = HDate.daysInMonth(month, year)
  const selDay = hd.getDate()
  const firstGreg = new HDate(1, month, year).greg()
  const lastGreg = new HDate(days, month, year).greg()
  const lead = firstGreg.getDay() // 0=Sun .. 6=Sat

  const hebMonthName = getHebrewDate(firstGreg).hebrewMonth
  const gregShort = (d: Date) => d.toLocaleDateString('he-IL', { month: 'short' })
  const gregRange = gregShort(firstGreg) === gregShort(lastGreg)
    ? gregShort(firstGreg)
    : `${gregShort(firstGreg)}–${gregShort(lastGreg)}`

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
        aria-label={`${gematriya(d)} ${hebMonthName}`}
      >
        <b>{gematriya(d)}</b>
        <i>{greg.getDate()}</i>
      </button>
    )
  }

  return (
    <div className="bg-surface border border-rule rounded-md p-3 mt-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <button type="button" onClick={() => onChange(moveHebrewMonth(date, -1))} className="p-1 text-gold" aria-label="חודש קודם">
          <ChevronRight className="w-4 h-4" />
        </button>
        <span className="font-display font-bold text-sm text-ink text-center">
          {hebMonthName} {gematriya(year % 1000)} · {gregRange} {firstGreg.getFullYear()}
        </span>
        <button type="button" onClick={() => onChange(moveHebrewMonth(date, 1))} className="p-1 text-gold" aria-label="חודש הבא">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
      <div className="dsy-calgrid mb-1">
        {DOW.map((d) => <span key={d} className="dsy-dw">{d}</span>)}
      </div>
      <div className="dsy-calgrid">{cells}</div>
    </div>
  )
}
