import { useEffect, useRef, useState } from 'react'
import { Search as SearchIcon, X, Loader2 } from 'lucide-react'
import { searchTzaddikim } from '../lib/queries'
import { TzaddikCard } from '../components/today/TzaddikCard'
import type { Tzaddik } from '../types'

export function Search() {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<Tzaddik[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    const q = term.trim()
    if (q.length < 2) { setResults([]); setSearched(false); setLoading(false); return }
    setLoading(true)
    timer.current = setTimeout(async () => {
      try {
        const rows = await searchTzaddikim(q)
        setResults(rows)
      } catch { setResults([]) }
      finally { setLoading(false); setSearched(true) }
    }, 300)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [term])

  return (
    <div dir="rtl" className="animate-[fadeIn_.3s_ease]">
      <div className="text-center mb-5">
        <h1 className="font-display font-black text-2xl sm:text-3xl text-ink">חיפוש צדיק</h1>
        <p className="text-[13px] text-ink-soft mt-1.5">חפשו לפי שם, כינוי, שם ספר או תפקיד</p>
      </div>

      {/* search box */}
      <div className="sticky top-2 z-10">
        <div className="relative">
          <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            ref={inputRef}
            value={term}
            onChange={e => setTerm(e.target.value)}
            placeholder="לדוגמה: חפץ חיים, בבא סאלי, אור החיים..."
            className="w-full rounded-2xl border border-rule bg-surface pr-12 pl-11 py-3.5 text-[15px] text-ink placeholder:text-muted outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 shadow-[0_6px_20px_-12px_var(--shadow)] transition"
          />
          {term && (
            <button
              onClick={() => { setTerm(''); inputRef.current?.focus() }}
              aria-label="נקה"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-muted hover:bg-surface-2 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* states */}
      <div className="mt-5">
        {loading && (
          <div className="flex items-center justify-center gap-2 text-muted py-10">
            <Loader2 className="w-5 h-5 animate-spin" /> מחפש...
          </div>
        )}

        {!loading && term.trim().length >= 2 && searched && results.length === 0 && (
          <div className="text-center text-muted py-10">
            <p className="text-[15px]">לא נמצאו תוצאות עבור "{term.trim()}"</p>
            <p className="text-[13px] mt-1.5">נסו כינוי אחר, שם ספר, או שם מלא</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div className="text-[12px] text-muted mb-2.5">{results.length} תוצאות</div>
            <div className="grid gap-2.5">
              {results.map(t => (
                <TzaddikCard key={t.id} tzaddik={t} variant="mini" showDate />
              ))}
            </div>
          </>
        )}

        {!loading && term.trim().length < 2 && (
          <div className="text-center text-muted py-12">
            <SearchIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-[14px]">הקלידו שם של צדיק כדי לחפש</p>
          </div>
        )}
      </div>
    </div>
  )
}
