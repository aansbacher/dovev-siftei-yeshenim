import { useState, useRef, useEffect } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import type { Tzaddik } from '../../types'
import { TzaddikCard } from './TzaddikCard'

interface TzaddikDeckProps {
  tzaddikim: Tzaddik[]
}

/**
 * One central tzaddik at a time, with a big, clear slider to move between the
 * day's tzadikim: large arrows, clear dots, and a "X מתוך Y" label. Swipe works too.
 * Default = the most well-known (index 0).
 */
export function TzaddikDeck({ tzaddikim }: TzaddikDeckProps) {
  const [i, setI] = useState(0)
  const startX = useRef<number | null>(null)
  const ids = tzaddikim.map(t => t.id).join(',')

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

  const bigArrow = 'shrink-0 w-12 h-12 rounded-full bg-gold text-white flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(91,118,229,.6)] hover:bg-gold-deep transition active:scale-95 disabled:opacity-25 disabled:shadow-none'

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* ── Big, clear slider control ── */}
      {!single && (
        <div className="flex items-center justify-between gap-3 mb-4 select-none">
          <button onClick={() => go(i - 1)} disabled={i === 0} aria-label="הצדיק הקודם" className={bigArrow}>
            <ChevronRight className="w-7 h-7" />
          </button>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2" role="tablist">
              {tzaddikim.map((_, k) => (
                <button
                  key={k}
                  onClick={() => go(k)}
                  aria-label={`צדיק ${k + 1}`}
                  aria-selected={k === i}
                  className={`h-2.5 rounded-full transition-all duration-300 ${k === i ? 'w-8 bg-gold' : 'w-2.5 bg-[color:var(--line)] hover:bg-gold/40'}`}
                />
              ))}
            </div>
            <span className="text-[13px] font-bold text-ink-soft">צדיק {i + 1} מתוך {n}</span>
          </div>

          <button onClick={() => go(i + 1)} disabled={i === n - 1} aria-label="הצדיק הבא" className={bigArrow}>
            <ChevronLeft className="w-7 h-7" />
          </button>
        </div>
      )}

      {/* ── The central card ── */}
      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div key={tzaddikim[i].id} className="dsy-slidein">
          <TzaddikCard tzaddik={tzaddikim[i]} variant="main" />
        </div>
      </div>

      {!single && (
        <p className="text-center text-[12px] text-muted mt-3.5">
          החליקו הצידה או הקישו על החצים לדפדוף בין צדיקי היום
        </p>
      )}
    </div>
  )
}
