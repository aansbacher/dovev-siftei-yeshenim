import { useState, useRef, useCallback } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import type { Tzaddik } from '../../types'
import { TzaddikCard } from './TzaddikCard'

interface TzaddikSliderProps {
  tzaddikim: Tzaddik[]
}

export function TzaddikSlider({ tzaddikim }: TzaddikSliderProps) {
  const [current, setCurrent] = useState(0)
  const startX = useRef<number | null>(null)
  const MIN_SWIPE = 50

  const goTo = useCallback(
    (i: number) => setCurrent(Math.max(0, Math.min(i, tzaddikim.length - 1))),
    [tzaddikim.length]
  )

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return
    const dx = startX.current - e.changedTouches[0].clientX
    if (Math.abs(dx) > MIN_SWIPE) {
      // RTL: swipe left (dx>0) = next card, swipe right (dx<0) = prev card
      if (dx > 0) goTo(current + 1)
      else goTo(current - 1)
    }
    startX.current = null
  }

  if (!tzaddikim.length) return null
  if (tzaddikim.length === 1) return <TzaddikCard tzaddik={tzaddikim[0]} />

  return (
    <div className="relative select-none">
      {/* Track */}
      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out will-change-transform"
          style={{ transform: `translateX(${-current * 100}%)` }}
        >
          {tzaddikim.map((tz) => (
            <div key={tz.id} className="min-w-full">
              <TzaddikCard tzaddik={tz} />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-center gap-3">
        {/* In RTL context: right chevron = previous, left chevron = next */}
        <button
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          aria-label="הקודם"
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="flex gap-1.5">
          {tzaddikim.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`צדיק ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 bg-indigo-600'
                  : 'w-2 bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => goTo(current + 1)}
          disabled={current === tzaddikim.length - 1}
          aria-label="הבא"
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <p className="mt-1 text-center text-xs text-slate-400">
        {current + 1} מתוך {tzaddikim.length}
      </p>
    </div>
  )
}
