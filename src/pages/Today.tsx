import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Moon } from 'lucide-react'
import type { Tzaddik } from '../types'
import { getHebrewDate } from '../lib/hebrewDate'
import { getTzaddikimForDate } from '../lib/queries'
import { HebrewDateBlock } from '../components/today/HebrewDateBlock'
import { TzaddikDeck } from '../components/today/TzaddikDeck'
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

  const emptyState = (
    <div className="max-w-2xl mx-auto w-full rounded-md border border-rule bg-surface p-10 text-center">
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

      {/* The day's tzadikim — swipeable deck, default = the most well-known */}
      {isLoading ? (
        <div className="max-w-2xl mx-auto w-full animate-pulse rounded-md border border-rule bg-surface h-[28rem]" />
      ) : tzaddikim.length ? (
        <TzaddikDeck tzaddikim={tzaddikim} />
      ) : (
        emptyState
      )}

      {/* Calendar + day navigation */}
      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto w-full">
        <HebrewCalendar date={selectedDate} onChange={setSelectedDate} />
        <DayNavigator date={selectedDate} onChange={setSelectedDate} />
      </div>

      {/* Subscribe */}
      <SubscribeForm />
    </div>
  )
}
