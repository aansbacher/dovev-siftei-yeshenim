import { useEffect, useState } from 'react'
import { Type } from 'lucide-react'

const FONTS = [
  { key: 'rubik', label: 'עגול', css: "'Rubik','Heebo',sans-serif" },
  { key: 'frank', label: 'קלאסי', css: "'Frank Ruhl Libre',Georgia,serif" },
  { key: 'heebo', label: 'רגיל', css: "'Heebo',sans-serif" },
]
const SIZES = [0.9, 1, 1.15, 1.3]

function read(key: string, fallback: string) {
  try { return localStorage.getItem(key) ?? fallback } catch { return fallback }
}

function apply(fontKey: string, scale: number) {
  const font = FONTS.find(f => f.key === fontKey) ?? FONTS[0]
  const root = document.documentElement
  root.style.setProperty('--read-font', font.css)
  root.style.setProperty('--read-scale', String(scale))
}

/** Compact reading-style control: switch reading font + size (persisted). */
export function ReadingPrefs() {
  const [open, setOpen] = useState(false)
  const [font, setFont] = useState(() => read('read-font', 'rubik'))
  const [scale, setScale] = useState(() => Number(read('read-scale', '1')))

  useEffect(() => { apply(font, scale) }, [font, scale])

  const setFontK = (k: string) => { setFont(k); try { localStorage.setItem('read-font', k) } catch {} }
  const setScaleN = (n: number) => { setScale(n); try { localStorage.setItem('read-scale', String(n)) } catch {} }
  const sizeIdx = Math.max(0, SIZES.indexOf(scale))

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="סגנון קריאה"
        className="flex items-center gap-1.5 rounded-full border border-rule bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-ink-soft hover:border-gold/40 transition"
      >
        <Type className="w-4 h-4 text-gold" />
        סגנון קריאה
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full mt-2 left-0 w-64 rounded-2xl bg-surface border border-rule shadow-[0_16px_36px_-14px_var(--shadow)] p-4">
            <p className="text-[12px] font-bold text-muted mb-2">גופן</p>
            <div className="grid grid-cols-3 gap-2">
              {FONTS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFontK(f.key)}
                  style={{ fontFamily: f.css }}
                  className={`rounded-xl py-2.5 text-[14px] font-semibold border transition
                    ${font === f.key ? 'border-gold bg-accent-soft text-ink' : 'border-rule bg-surface text-ink-soft hover:bg-surface-2'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <p className="text-[12px] font-bold text-muted mt-4 mb-2">גודל טקסט</p>
            <div className="flex items-center gap-2">
              {SIZES.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setScaleN(s)}
                  className={`flex-1 rounded-xl py-2 border transition font-display
                    ${sizeIdx === i ? 'border-gold bg-accent-soft text-ink' : 'border-rule bg-surface text-ink-soft hover:bg-surface-2'}`}
                  style={{ fontSize: `${11 + i * 3}px` }}
                >
                  א
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
