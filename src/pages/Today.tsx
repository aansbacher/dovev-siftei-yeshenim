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

  return (
    <div className="grid gap-5 pb-10">
      {/* Date header */}
      <HebrewDateBlock
        hebrewDateDisplay={hebrew.hebrewDateDisplay}
        parasha={hebrew.parasha}
        gregorianDate={hebrew.gregorianDate}
        totalTzaddikim={tzaddikim.length}
        specialDays={hebrew.specialDays}
      />

      {/* Main tzaddik card */}
      {isLoading ? (
        <div className="animate-pulse rounded-2xl border border-gray-light bg-white h-[28rem]" />
      ) : mainTzaddik ? (
        <TzaddikCard tzaddik={mainTzaddik} variant="main" />
      ) : (
        <div className="rounded-2xl border border-gray-light bg-white p-10 text-center">
          <Moon className="mx-auto h-8 w-8 text-navy/20" />
          <p className="mt-3 text-lg font-bold text-navy">אין צדיקים מתועדים ליום זה</p>
          <p className="mt-1 text-sm text-navy/40">נסה לבחור תאריך אחר</p>
        </div>
      )}

      {/* Secondary tzaddikim slider */}
      {restTzaddikim.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-navy/50 mb-3 px-1">
            עוד מבעלי ההילולה של היום
          </h3>
          <TzaddikSlider tzaddikim={restTzaddikim} />
        </section>
      )}

      {/* Navigation */}
      <DayNavigator date={selectedDate} onChange={setSelectedDate} />

      {/* Subscribe */}
      <SubscribeForm />
    </div>
  )
}
