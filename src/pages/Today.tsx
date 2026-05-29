import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Moon } from 'lucide-react'
import type { Tzaddik } from '../types'
import { getHebrewDate } from '../lib/hebrewDate'
import { getTzaddikimForDate } from '../lib/queries'
import { HebrewDateBlock } from '../components/today/HebrewDateBlock'
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

  return (
    <div className="grid gap-6 pb-10">
      <HebrewDateBlock
        hebrewDateDisplay={hebrew.hebrewDateDisplay}
        parasha={hebrew.parasha}
        gregorianDate={hebrew.gregorianDate}
        totalTzaddikim={tzaddikim.length}
      />
      <div>
        {isLoading ? (
          <div className="animate-pulse rounded-[2rem] border border-slate-200 bg-white/90 h-80 shadow-sm dark:border-slate-800 dark:bg-slate-950/80" />
        ) : tzaddikim.length > 0 ? (
          <TzaddikSlider tzaddikim={tzaddikim} />
        ) : (
          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
            <Moon className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 text-lg font-semibold text-slate-700 dark:text-slate-300">אין צדיקים מתועדים ליום זה</p>
            <p className="mt-1 text-sm text-slate-500">נסה לבחור תאריך אחר</p>
          </div>
        )}
      </div>
      <DayNavigator date={selectedDate} onChange={setSelectedDate} />
      <SubscribeForm />
    </div>
  )
}
