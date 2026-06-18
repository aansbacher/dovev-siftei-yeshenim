import { useState, useRef, useCallback } from 'react'
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
      if (dx > 0) goTo(current + 1)
      else goTo(current - 1)
    }
    startX.current = null
  }

  if (!tzaddikim.length) return null
  if (tzaddikim.length === 1) {
    return <TzaddikCard tzaddik={tzaddikim[0]} variant="mini" />
  }

  return (
    <div className="select-none">
      {/* Track — 80% card width, shows peek of next card */}
      <div
        className="overflow-hidden"
        dir="ltr"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex gap-3 transition-transform duration-300 ease-out will-change-transform"
          style={{
            transform: `translateX(calc(${current * -80}% - ${current * 12}px))`,
          }}
        >
          {tzaddikim.map((tz) => (
            <div key={tz.id} dir="rtl" className="flex-shrink-0 w-[80%]">
              <TzaddikCard tzaddik={tz} variant="mini" />
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      {tzaddikim.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {tzaddikim.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`צדיק ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-5 bg-gold' : 'w-1.5 bg-gray-light'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
