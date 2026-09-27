import { useState, useRef, useEffect } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import type { Tzaddik } from '../../types'
import { TzaddikCard } from './TzaddikCard'

interface TzaddikDeckProps {
  tzaddikim: Tzaddik[]
}

/**
 * The day's tzadikim as a clear carousel:
 *  - native scroll-snap so neighbours peek and swiping is smooth (RTL-safe)
 *  - pagination dots (active / inactive)
 *  - persistent high-contrast arrows on desktop
 * Default = the most well-known (index 0).
 */
export function TzaddikDeck({ tzaddikim }: TzaddikDeckProps) {
  const [i, setI] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)
  const slides = useRef<(HTMLDivElement | null)[]>([])
  const ids = tzaddikim.map(t => t.id).join(',')

  const n = tzaddikim.length
  const single = n === 1

  // reset to the most-known tzaddik whenever the day changes
  useEffect(() => {
    setI(0)
    requestAnimationFrame(() => slides.current[0]?.scrollIntoView({ inline: 'center', block: 'nearest' }))
  }, [ids])

  if (!n) return null

  const goTo = (k: number) => {
    const c = Math.max(0, Math.min(k, n - 1))
    slides.current[c]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  // keep the active dot in sync with whatever is nearest the centre while swiping
  const onScroll = () => {
    const sc = scroller.current
    if (!sc) return
    const centre = sc.scrollLeft + sc.clientWidth / 2
    let best = 0, bestDist = Infinity
    slides.current.forEach((el, k) => {
      if (!el) return
      const c = el.offsetLeft + el.offsetWidth / 2
      const d = Math.abs(c - centre)
      if (d < bestDist) { bestDist = d; best = k }
    })
    setI(best)
  }

  const arrow = 'w-11 h-11 rounded-full bg-gold text-white shadow-[0_8px_20px_-6px_rgba(91,118,229,.6)] flex items-center justify-center hover:bg-gold-deep transition disabled:opacity-30 disabled:shadow-none'

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="relative">
        {/* ── Persistent arrows (desktop / large screens) ── */}
        {!single && (
          <>
            <button
              onClick={() => goTo(i + 1)} disabled={i === n - 1} aria-label="הצדיק הבא"
              className={`hidden md:flex absolute right-[-6px] lg:right-[-20px] top-1/2 -translate-y-1/2 z-20 ${arrow}`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <button
              onClick={() => goTo(i - 1)} disabled={i === 0} aria-label="הצדיק הקודם"
              className={`hidden md:flex absolute left-[-6px] lg:left-[-20px] top-1/2 -translate-y-1/2 z-20 ${arrow}`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </>
        )}

        {/* ── Peeking, snap-scrolling track ── */}
        <div
          ref={scroller}
          onScroll={onScroll}
          className={`flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${single ? '' : 'gap-3 px-[8%]'}`}
        >
          {tzaddikim.map((t, k) => (
            <div
              key={t.id}
              ref={el => { slides.current[k] = el }}
              className={`snap-center shrink-0 ${single ? 'w-full' : 'w-[84%]'} transition-opacity duration-300 ${k === i ? 'opacity-100' : 'opacity-50'}`}
            >
              <TzaddikCard tzaddik={t} variant="main" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Pagination dots ── */}
      {!single && (
        <div className="flex items-center justify-center gap-1.5 mt-4" role="tablist">
          {tzaddikim.map((_, k) => (
            <button
              key={k}
              onClick={() => goTo(k)}
              aria-label={`צדיק ${k + 1}`}
              aria-selected={k === i}
              className={`h-2 rounded-full transition-all duration-300 ${k === i ? 'w-7 bg-gold' : 'w-2 bg-[color:var(--line)] hover:bg-gold/40'}`}
            />
          ))}
        </div>
      )}

      {!single && (
        <p className="text-center text-[12px] text-muted mt-2.5">
          {i + 1} מתוך {n} · החליקו לדפדוף בין צדיקי היום
        </p>
      )}
    </div>
  )
}
