import { HDate } from '@hebcal/core'
import { getHebrewDate } from '../../lib/hebrewDate'
import { ChevronRight, ChevronLeft } from 'lucide-react'

interface DayNavigatorProps {
  date: Date
  onChange: (date: Date) => void
}

function moveHebrewMonth(date: Date, delta: number): Date {
  const hd = new HDate(date)
  let month = hd.getMonth() + delta
  let year  = hd.getFullYear()
  const monthsInYear = HDate.monthsInYear(year)
  if (month < 1)               { year -= 1; month = HDate.monthsInYear(year) }
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
    <div className="rounded-2xl border border-gray-light bg-white px-4 py-4 shadow-sm">
      <p className="text-xs font-semibold text-navy/30 uppercase tracking-widest text-center mb-4">
        ניווט יומי
      </p>

      {/* Day navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => moveDay(-1)}
          className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-cream border border-gray-light text-navy font-semibold text-sm transition hover:bg-cream-dark active:scale-95"
        >
          <ChevronRight className="h-4 w-4" />
          יום קודם
        </button>

        <div className="text-center flex-1">
          <p className="text-sm font-bold text-navy">{hebrewDateDisplay}</p>
        </div>

        <button
          type="button"
          onClick={() => moveDay(1)}
          className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-cream border border-gray-light text-navy font-semibold text-sm transition hover:bg-cream-dark active:scale-95"
        >
          יום הבא
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between gap-3 mt-2">
        <button
          type="button"
          onClick={() => onChange(moveHebrewMonth(date, -1))}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-light text-navy/50 font-medium text-xs transition hover:border-navy/20 hover:text-navy active:scale-95"
        >
          <ChevronRight className="h-3.5 w-3.5" />
          חודש קודם
        </button>

        <button
          type="button"
          onClick={() => onChange(moveHebrewMonth(date, 1))}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-light text-navy/50 font-medium text-xs transition hover:border-navy/20 hover:text-navy active:scale-95"
        >
          חודש הבא
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Date picker */}
      <div className="mt-3 flex justify-center">
        <input
          type="date"
          value={isoDate}
          onChange={(e) => {
            const [year, month, day] = e.target.value.split('-').map(Number)
            onChange(new Date(year, month - 1, day))
          }}
          className="rounded-xl border border-gray-light bg-cream px-4 py-2 text-sm text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
        />
      </div>
    </div>
  )
}
