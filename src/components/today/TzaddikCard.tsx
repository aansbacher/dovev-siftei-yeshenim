import { useState } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { Heart, Share2, Copy, BookOpen, Send, Loader2 } from 'lucide-react'
import type { Tzaddik } from '../../types'
import { BottomSheet } from '../ui/BottomSheet'

const LIKED_KEY = 'dshy_liked'

function getLiked(): Set<number> {
  try { return new Set(JSON.parse(localStorage.getItem(LIKED_KEY) ?? '[]')) }
  catch { return new Set() }
}

function toggleLiked(id: number): boolean {
  const s = getLiked()
  s.has(id) ? s.delete(id) : s.add(id)
  localStorage.setItem(LIKED_KEY, JSON.stringify([...s]))
  return s.has(id)
}

async function shareTzaddik(tzaddik: Tzaddik) {
  const text = tzaddik.quote
    ? `"${tzaddik.quote}"\n— ${tzaddik.popularName}\n\nדובב שפתי ישנים`
    : `${tzaddik.popularName} — דובב שפתי ישנים`
  if (navigator.share) {
    await navigator.share({ text, url: window.location.href }).catch(() => {})
  } else {
    await navigator.clipboard.writeText(text).catch(() => {})
  }
}

async function copyTzaddik(tzaddik: Tzaddik) {
  const text = tzaddik.quote
    ? `"${tzaddik.quote}"\n— ${tzaddik.popularName}`
    : tzaddik.popularName
  await navigator.clipboard.writeText(text).catch(() => {})
}

interface TzaddikCardProps {
  tzaddik: Tzaddik
  variant?: 'main' | 'mini'
}

// ── AI Ask box ─────────────────────────────────────────────────────────────

const tabPlaceholders: Record<string, string> = {
  teaching: 'שאל על תורתו, ספריו, אמרותיו...',
  story:    'שאל על סיפור מחייו...',
  bio:      'שאל על ביוגרפיה, תפקידים, משפחה...',
}

function AskBox({ tzaddikName, tabType }: { tzaddikName: string; tabType: string }) {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ask = async () => {
    if (!query.trim() || loading) return
    setLoading(true)
    setAnswer('')
    setError('')
    try {
      const res = await fetch('/api/chat-tzaddik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tzaddikName, query: query.trim(), tabType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAnswer(data.answer)
    } catch (e: any) {
      setError(e.message ?? 'שגיאה. נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 pt-3 border-t border-gray-light">
      <p className="text-[11px] font-semibold text-navy/30 uppercase tracking-widest mb-2">שאל שאלה</p>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask()}
          placeholder={tabPlaceholders[tabType] ?? 'שאל שאלה...'}
          className="flex-1 text-sm rounded-xl border border-gray-light bg-cream px-3 py-2 text-navy placeholder-navy/30 outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition"
          style={{ backgroundColor: '#F7F3EA' }}
          dir="rtl"
        />
        <button
          onClick={ask}
          disabled={!query.trim() || loading}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-navy text-cream disabled:opacity-40 transition active:scale-95 flex-shrink-0"
          style={{ backgroundColor: '#1E2A38' }}
        >
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />}
        </button>
      </div>
      {answer && (
        <div className="mt-3 rounded-xl bg-cream px-3 py-3 text-sm leading-7 text-navy/80 whitespace-pre-wrap" style={{ backgroundColor: '#F7F3EA' }} dir="rtl">
          {answer}
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ── Main full card ──────────────────────────────────────────────────────────

const TABS = [
  { value: 'teaching', label: 'מתורתו',  key: 'torah' as const,     empty: 'אין תורה זמינה' },
  { value: 'story',    label: 'סיפור',   key: 'story' as const,     empty: 'אין סיפור זמין' },
  { value: 'bio',      label: 'מי היה',  key: 'biography' as const, empty: 'אין רקע זמין' },
]

function DeepenSheet({ tzaddik }: { tzaddik: Tzaddik }) {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Message */}
      {tzaddik.quote && (
        <div className="bg-navy rounded-2xl px-5 py-4" style={{ backgroundColor: '#1E2A38', color: '#F7F3EA' }}>
          <p className="text-xs font-semibold text-gold/80 mb-2 uppercase tracking-wider" style={{ color: '#B89552' }}>מסר לחיים</p>
          <p className="text-cream font-semibold leading-7 text-sm">"{tzaddik.quote}"</p>
          <p className="text-cream/40 text-xs mt-2 text-left" style={{ color: 'rgba(247,243,234,0.4)' }}>— {tzaddik.popularName}</p>
        </div>
      )}

      {/* Extended Torah */}
      {tzaddik.torah && (
        <div>
          <h4 className="text-sm font-bold text-navy mb-2 flex items-center gap-2">
            <span className="text-gold">📖</span> עוד מתורתו
          </h4>
          <p className="text-sm leading-7 text-text/80">{tzaddik.torah}</p>
        </div>
      )}

      {/* Full story */}
      {tzaddik.story && (
        <div>
          <h4 className="text-sm font-bold text-navy mb-2 flex items-center gap-2">
            <span className="text-gold">🕯️</span> סיפור
          </h4>
          <p className="text-sm leading-7 text-text/80">{tzaddik.story}</p>
        </div>
      )}

      {/* Know the tzaddik */}
      <div>
        <h4 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
          <span className="text-gold">🏛️</span> להכיר את הצדיק
        </h4>
        <div className="space-y-2">
          {tzaddik.fullName && (
            <div className="flex gap-3">
              <span className="text-xs text-navy/40 min-w-[4rem]">שם מלא</span>
              <span className="text-sm text-text">{tzaddik.fullName}</span>
            </div>
          )}
          {tzaddik.years && (
            <div className="flex gap-3">
              <span className="text-xs text-navy/40 min-w-[4rem]">שנים</span>
              <span className="text-sm text-text">{tzaddik.years}</span>
            </div>
          )}
          {tzaddik.stream && (
            <div className="flex gap-3">
              <span className="text-xs text-navy/40 min-w-[4rem]">זרם</span>
              <span className="text-sm text-text">{tzaddik.stream}</span>
            </div>
          )}
          {tzaddik.role && (
            <div className="flex gap-3">
              <span className="text-xs text-navy/40 min-w-[4rem]">תפקיד</span>
              <span className="text-sm text-text">{tzaddik.role}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sources */}
      {tzaddik.sources && tzaddik.sources.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-navy/40 mb-2 uppercase tracking-wider">מקורות</h4>
          <div className="flex flex-wrap gap-2">
            {tzaddik.sources.map(s => (
              <span key={s} className="text-xs bg-cream rounded-full px-3 py-1 text-navy/60 border border-gray-light">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function TzaddikCard({ tzaddik, variant = 'main' }: TzaddikCardProps) {
  const [liked, setLiked] = useState(() => getLiked().has(tzaddik.id))
  const [copied, setCopied] = useState(false)
  const [deepenOpen, setDeepenOpen] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [activeTab, setActiveTab] = useState('teaching')

  const handleCopy = async () => {
    await copyTzaddik(tzaddik)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (variant === 'mini') {
    return (
      <>
        <article
          onClick={() => setDeepenOpen(true)}
          className="relative flex gap-3 items-center bg-surface border border-rule rounded-md p-2.5 h-full cursor-pointer transition hover:border-gold/50"
        >
          {/* gold accent bar (start / right in RTL) */}
          <span className="absolute top-0 bottom-0 right-0 w-[3px] bg-gold/50 rounded-r-md" />
          {/* thumbnail */}
          <div className="shrink-0 w-[50px] h-[62px] rounded-[2px] border border-[color:var(--line)] bg-surface-2 overflow-hidden">
            {tzaddik.imageUrl && !imgError ? (
              <img
                src={tzaddik.imageUrl}
                alt={tzaddik.popularName}
                className="w-full h-full object-cover object-top block"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-navy">
                <span className="font-display text-xl text-white/15">
                  {tzaddik.popularName?.trimStart().slice(0, 2) ?? '?'}
                </span>
              </div>
            )}
          </div>
          {/* text */}
          <div className="min-w-0">
            <div className="font-display font-bold text-[16px] text-ink leading-tight line-clamp-1">{tzaddik.popularName}</div>
            {tzaddik.biography && (
              <div className="text-[12.5px] text-muted mt-0.5 leading-snug line-clamp-2">{tzaddik.biography}</div>
            )}
          </div>
        </article>

        <BottomSheet
          isOpen={deepenOpen}
          onClose={() => setDeepenOpen(false)}
          title={`📚 ${tzaddik.popularName}`}
        >
          <DeepenSheet tzaddik={tzaddik} />
        </BottomSheet>
      </>
    )
  }

  const subline = [tzaddik.stream, tzaddik.role, tzaddik.years].filter(Boolean).join(' · ')

  return (
    <>
      <article dir="rtl" className="dsy-card relative overflow-hidden rounded-md bg-surface border border-rule shadow-[0_18px_40px_-30px_var(--shadow)] p-5 sm:p-8">
        <span className="dsy-cor tl" /><span className="dsy-cor tr" /><span className="dsy-cor bl" /><span className="dsy-cor br" />

        {/* ── Head: framed portrait + name ── */}
        <div className="relative z-[1] flex gap-4 sm:gap-5 items-center">
          <div className="shrink-0 w-[100px] h-[126px] sm:w-[104px] sm:h-[130px] rounded-[3px] border border-gold p-1 bg-surface-2 overflow-hidden shadow-[0_8px_20px_-12px_var(--shadow)]">
            {tzaddik.imageUrl && !imgError ? (
              <img
                src={tzaddik.imageUrl}
                alt={tzaddik.popularName}
                className="w-full h-full object-cover object-top rounded-[2px] block"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full rounded-[2px] flex items-center justify-center bg-navy">
                <span className="font-display text-3xl text-white/15">
                  {tzaddik.popularName?.trimStart().slice(0, 2) ?? '?'}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold tracking-[3px] text-gold mb-1.5">בעל ההילולה</div>
            <h2 className="font-display font-bold text-2xl sm:text-[31px] leading-tight text-ink text-balance">
              {tzaddik.popularName}
            </h2>
            {subline && <div className="mt-1.5 text-[13px] text-muted">{subline}</div>}
          </div>
        </div>

        {/* ── Pull-quote ── */}
        {tzaddik.quote && (
          <div className="dsy-pull mt-6 mb-0.5">
            <span className="qm">״</span>
            <p className="font-display font-medium text-lg sm:text-[22px] leading-[1.75] text-ink text-pretty">
              {tzaddik.quote}
            </p>
          </div>
        )}

        {/* ── Tabs ── */}
        <TabsPrimitive.Root value={activeTab} onValueChange={setActiveTab} dir="rtl" className="mt-7">
          <TabsPrimitive.List className="flex border-b border-rule">
            {TABS.map(({ value, label }) => (
              <TabsPrimitive.Trigger
                key={value}
                value={value}
                className="flex-1 py-3 font-display text-base font-semibold text-ink-soft transition
                  data-[state=active]:border-b-2 data-[state=active]:border-gold
                  data-[state=active]:text-ink"
              >
                {label}
              </TabsPrimitive.Trigger>
            ))}
          </TabsPrimitive.List>

          {TABS.map(({ value, key, empty }) => {
            const content = tzaddik[key]
            return (
              <TabsPrimitive.Content
                key={value}
                value={value}
                className="pt-4 min-h-[5rem] text-[15px] leading-[1.85] text-ink-soft"
              >
                {content
                  ? <p className="whitespace-pre-wrap">{content}</p>
                  : <span className="italic text-muted">{empty}</span>}
                <AskBox tzaddikName={tzaddik.popularName} tabType={value} />
              </TabsPrimitive.Content>
            )
          })}
        </TabsPrimitive.Root>

        {/* ── Actions ── */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <button
            onClick={() => setDeepenOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-ink text-ground text-[13.5px] font-semibold hover:opacity-90 transition"
          >
            <BookOpen className="h-4 w-4" />
            העמק בצדיק
          </button>
          <button
            onClick={() => shareTzaddik(tzaddik)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-rule bg-surface-2 text-ink text-[13.5px] font-semibold hover:border-gold/50 transition"
          >
            <Share2 className="h-4 w-4 text-ink-soft" />
            שתף
          </button>
          <button
            onClick={() => setLiked(toggleLiked(tzaddik.id))}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13.5px] font-semibold transition border ${
              liked ? 'bg-gold text-white border-gold' : 'border-rule bg-surface-2 text-ink hover:border-gold/50'
            }`}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-current' : 'text-ink-soft'}`} />
            {liked ? 'נשמר' : 'שמירה'}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-rule bg-surface-2 text-ink text-[13.5px] font-semibold hover:border-gold/50 transition mr-auto"
          >
            <Copy className="h-4 w-4 text-ink-soft" />
            {copied ? 'הועתק ✓' : 'העתק'}
          </button>
        </div>
      </article>

      {/* Deepen Bottom Sheet */}
      <BottomSheet
        isOpen={deepenOpen}
        onClose={() => setDeepenOpen(false)}
        title={`📚 ${tzaddik.popularName}`}
      >
        <DeepenSheet tzaddik={tzaddik} />
      </BottomSheet>
    </>
  )
}
