import { HDate } from '@hebcal/core'
import { getHebrewDate } from '../../lib/hebrewDate'
import { ChevronRight, ChevronLeft, CalendarDays } from 'lucide-react'

interface DayNavigatorProps {
  date: Date
  onChange: (date: Date) => void
}

function moveHebrewMonth(date: Date, delta: number): Date {
  const hd = new HDate(date)
  let month = hd.getMonth() + delta
  let year  = hd.getFullYear()
  const monthsInYear = HDate.monthsInYear(year)
  if (month < 1)                 { year -= 1; month = HDate.monthsInYear(year) }
  else if (month > monthsInYear) { year += 1; month = 1 }
  return new HDate(1, month, year).greg()
}

export function DayNavigator({ date, onChange }: DayNavigatorProps) {
  const isoDate = date.toISOString().slice(0, 10)
  const todayIso = new Date().toISOString().slice(0, 10)
  const isToday = isoDate === todayIso
  const { hebrewDateDisplay } = getHebrewDate(date)

  const moveDay = (amount: number) => {
    const next = new Date(date)
    next.setDate(date.getDate() + amount)
    onChange(next)
  }

  return (
    <div className="rounded-2xl border border-rule bg-surface p-3 shadow-[0_6px_20px_-12px_var(--shadow)]">
      {/* ── אתמול · היום · מחר ── */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={() => moveDay(-1)}
          className="flex items-center justify-center gap-1 rounded-xl bg-surface-2 border border-rule py-3 text-[13px] font-semibold text-ink-soft hover:border-gold/40 transition active:scale-95"
        >
          <ChevronRight className="h-4 w-4" />
          אתמול
        </button>

        <button
          type="button"
          onClick={() => onChange(new Date())}
          aria-label="חזרה להיום"
          className="flex flex-col items-center justify-center rounded-xl bg-accent-soft border border-[color:var(--warm-line)] py-1.5 leading-tight transition active:scale-95"
        >
          <span className="text-[10px] font-bold text-warm-deep">{isToday ? 'היום' : 'חזרה להיום'}</span>
          <span className="text-[13.5px] font-black text-ink">{hebrewDateDisplay}</span>
        </button>

        <button
          type="button"
          onClick={() => moveDay(1)}
          className="flex items-center justify-center gap-1 rounded-xl bg-surface-2 border border-rule py-3 text-[13px] font-semibold text-ink-soft hover:border-gold/40 transition active:scale-95"
        >
          מחר
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* ── Month jump + exact date (secondary) ── */}
      <div className="flex items-center justify-between gap-2 mt-2.5">
        <button
          type="button"
          onClick={() => onChange(moveHebrewMonth(date, -1))}
          className="flex items-center gap-1 text-[12px] font-medium text-muted hover:text-ink transition px-2 py-1.5"
        >
          <ChevronRight className="h-3.5 w-3.5" />
          חודש קודם
        </button>

        <label className="flex items-center gap-1.5 text-[12px] text-muted cursor-pointer hover:text-ink transition">
          <CalendarDays className="h-3.5 w-3.5" />
          <input
            type="date"
            value={isoDate}
            onChange={(e) => {
              const [year, month, day] = e.target.value.split('-').map(Number)
              onChange(new Date(year, month - 1, day))
            }}
            className="bg-transparent outline-none text-[12px] text-muted"
          />
        </label>

        <button
          type="button"
          onClick={() => onChange(moveHebrewMonth(date, 1))}
          className="flex items-center gap-1 text-[12px] font-medium text-muted hover:text-ink transition px-2 py-1.5"
        >
          חודש הבא
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
