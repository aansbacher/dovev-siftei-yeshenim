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
    <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/80 sm:flex-row sm:items-center sm:justify-between overflow-hidden">
      {/* Day navigation */}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => moveDay(-1)}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
          יום קודם
        </button>
        <button type="button" onClick={() => moveDay(1)}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
          יום הבא
        </button>
        <span className="mx-1 text-slate-300 dark:text-slate-600">|</span>
        <button type="button" onClick={() => onChange(moveHebrewMonth(date, -1))}
          className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
          חודש עברי קודם
        </button>
        <button type="button" onClick={() => onChange(moveHebrewMonth(date, 1))}
          className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
          חודש עברי הבא
        </button>
      </div>

      {/* Date pickers */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="text-xs font-medium text-amber-700 dark:text-amber-300">{hebrewDateDisplay}</span>
          <input
            type="date"
            value={isoDate}
            onChange={(event) => {
              const [year, month, day] = event.target.value.split('-').map(Number)
              onChange(new Date(year, month - 1, day))
            }}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
      </div>
    </div>
  )
}
