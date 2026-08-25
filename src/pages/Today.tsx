import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Moon } from 'lucide-react'
import type { Tzaddik } from '../types'
import { getHebrewDate } from '../lib/hebrewDate'
import { getTzaddikimForDate } from '../lib/queries'
import { HebrewDateBlock } from '../components/today/HebrewDateBlock'
import { TzaddikCard } from '../components/today/TzaddikCard'
import { TzaddikSlider } from '../components/today/TzaddikSlider'
import { DayNavigator } from '../components/today/DayNavigator'
import { HebrewCalendar } from '../components/today/HebrewCalendar'
import { SubscribeForm } from '../components/subscribe/SubscribeForm'

export function Today() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const hebrew = getHebrewDate(selectedDate)

  const tzaddikQuery = useQuery<Tzaddik[], Error>({
    queryKey: ['tzaddikim', selectedDate.toISOString()],
    queryFn: () => getTzaddikimForDate(hebrew.hebrewDay, hebrew.hebrewMonth),
  })

  const tzaddikim = tzaddikQuery.data ?? []
  const isLoading = tzaddikQuery.isLoading
  const [mainTzaddik, ...restTzaddikim] = tzaddikim

  const emptyState = (
    <div className="rounded-md border border-rule bg-surface p-10 text-center">
      <Moon className="mx-auto h-8 w-8 text-gold/40" />
      <p className="mt-3 font-display text-xl font-bold text-ink">אין צדיקים מתועדים ליום זה</p>
      <p className="mt-1 text-sm text-muted">נסו לבחור תאריך אחר בלוח</p>
    </div>
  )

  return (
    <div className="grid gap-4 sm:gap-6 pb-10">
      {/* Masthead */}
      <HebrewDateBlock
        hebrewDateDisplay={hebrew.hebrewDateDisplay}
        parasha={hebrew.parasha}
        gregorianDate={hebrew.gregorianDate}
        totalTzaddikim={tzaddikim.length}
        specialDays={hebrew.specialDays}
      />

      {/* Content — single column mobile, 2-col desktop */}
      <div className="grid gap-5 lg:grid-cols-[1fr,300px] lg:items-start">
        {/* Main card */}
        <div>
          {isLoading ? (
            <div className="animate-pulse rounded-md border border-rule bg-surface h-[28rem]" />
          ) : mainTzaddik ? (
            <TzaddikCard tzaddik={mainTzaddik} variant="main" />
          ) : (
            emptyState
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {restTzaddikim.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2.5 text-xs font-bold tracking-[2px] text-muted mb-3 px-1">
                עוד מבעלי ההילולה
                <span className="flex-1 h-px bg-[color:var(--line)]" />
              </h3>
              {/* Desktop: stacked mini cards */}
              <div className="hidden lg:flex lg:flex-col lg:gap-2.5">
                {restTzaddikim.map(tz => (
                  <TzaddikCard key={tz.id} tzaddik={tz} variant="mini" />
                ))}
              </div>
              {/* Mobile: swipe slider */}
              <div className="lg:hidden">
                <TzaddikSlider tzaddikim={restTzaddikim} />
              </div>
            </section>
          )}

          {/* Calendar (Hebrew + Gregorian) */}
          <HebrewCalendar date={selectedDate} onChange={setSelectedDate} />

          {/* Day navigator */}
          <DayNavigator date={selectedDate} onChange={setSelectedDate} />
        </div>
      </div>

      {/* Subscribe */}
      <SubscribeForm />
    </div>
  )
}
