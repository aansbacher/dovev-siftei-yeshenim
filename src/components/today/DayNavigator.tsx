import { HDate } from '@hebcal/core'
import { getHebrewDate } from '../../lib/hebrewDate'

interface DayNavigatorProps {
  date: Date
  onChange: (date: Date) => void
}

function moveHebrewMonth(date: Date, delta: number): Date {
  const hd = new HDate(date)
  let month = hd.getMonth() + delta
  let year  = hd.getFullYear()
  const monthsInYear = HDate.monthsInYear(year)
  if (month < 1)           { year -= 1; month = HDate.monthsInYear(year) }
  else if (month > monthsInYear) { year += 1; month = 1 }
  return new HDate(1, month, year).greg()
}

export function DayNavigator({ date, onChange }: DayNavigatorProps) {
  const isoDate = date.toISOString().slice(0, 10)
  const { hebrewDateDisplay } = getHebrewDate(date)

  const moveDay = (amount: number) => {
    const next = new Date(date)
    next.setDate(date.getDate() + amount)
    onChange(next)
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">דלג לתאריך</p>

      {/* Day + month navigation */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          <button type="button" onClick={() => moveDay(-1)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            ← יום
          </button>
          <button type="button" onClick={() => onChange(moveHebrewMonth(date, -1))}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            ← חודש
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{hebrewDateDisplay}</p>
        </div>

        <div className="flex gap-1.5">
          <button type="button" onClick={() => onChange(moveHebrewMonth(date, 1))}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            חודש →
          </button>
          <button type="button" onClick={() => moveDay(1)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            יום →
          </button>
        </div>
      </div>

      {/* Date picker */}
      <div className="mt-3 flex items-center justify-center">
        <input
          type="date"
          value={isoDate}
          onChange={(event) => {
            const [year, month, day] = event.target.value.split('-').map(Number)
            onChange(new Date(year, month - 1, day))
          }}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
    </div>
  )
}
