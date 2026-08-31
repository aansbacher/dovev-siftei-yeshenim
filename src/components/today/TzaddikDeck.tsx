import { useState, useRef, useEffect } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import type { Tzaddik } from '../../types'
import { TzaddikCard } from './TzaddikCard'

interface TzaddikDeckProps {
  tzaddikim: Tzaddik[]
}

/** A clean, swipeable deck of the day's tzadikim. Default = the most well-known (index 0). */
export function TzaddikDeck({ tzaddikim }: TzaddikDeckProps) {
  const [i, setI] = useState(0)
  const startX = useRef<number | null>(null)
  const ids = tzaddikim.map(t => t.id).join(',')

  // reset to the most-known tzaddik whenever the day changes
  useEffect(() => { setI(0) }, [ids])

  const n = tzaddikim.length
  if (!n) return null
  const go = (x: number) => setI(Math.max(0, Math.min(x, n - 1)))
  const single = n === 1

  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return
    const dx = startX.current - e.changedTouches[0].clientX
    if (Math.abs(dx) > 45) { dx > 0 ? go(i + 1) : go(i - 1) }
    startX.current = null
  }

  const arrowCls = 'w-9 h-9 rounded-full border border-rule bg-surface flex items-center justify-center text-gold hover:border-gold/50 transition disabled:opacity-25 disabled:cursor-default'

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* ── Slider controls ── */}
      {!single && (
        <div className="flex items-center justify-center gap-4 mb-4 select-none">
          <button onClick={() => go(i - 1)} disabled={i === 0} aria-label="הצדיק הקודם" className={arrowCls}>
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5" role="tablist">
            {tzaddikim.map((_, k) => (
              <button
                key={k}
                onClick={() => go(k)}
                aria-label={`צדיק ${k + 1}`}
                aria-selected={k === i}
                className={`h-2 rounded-full transition-all duration-300 ${k === i ? 'w-6 bg-gold' : 'w-2 bg-[color:var(--line)] hover:bg-gold/40'}`}
              />
            ))}
          </div>
          <button onClick={() => go(i + 1)} disabled={i === n - 1} aria-label="הצדיק הבא" className={arrowCls}>
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ── Current card (swipeable) ── */}
      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div key={tzaddikim[i].id} className="dsy-slidein">
          <TzaddikCard tzaddik={tzaddikim[i]} variant="main" />
        </div>
      </div>

      {/* ── Hint ── */}
      {!single && (
        <p className="text-center text-[12px] text-muted mt-3.5">
          {i + 1} מתוך {n} · החליקו או הקישו לדפדוף בין צדיקי היום
        </p>
      )}
    </div>
  )
}
