import { useState } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { Heart, Share2, Copy, BookOpen } from 'lucide-react'
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
        <div className="bg-navy rounded-2xl px-5 py-4">
          <p className="text-xs font-semibold text-gold/80 mb-2 uppercase tracking-wider">מסר לחיים</p>
          <p className="text-cream font-semibold leading-7 text-sm">"{tzaddik.quote}"</p>
          <p className="text-cream/40 text-xs mt-2 text-left">— {tzaddik.popularName}</p>
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

  const handleCopy = async () => {
    await copyTzaddik(tzaddik)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (variant === 'mini') {
    return (
      <article className="overflow-hidden rounded-2xl bg-white border border-gray-light shadow-sm flex flex-col h-full">
        {/* Image */}
        <div className="relative flex-shrink-0">
          {tzaddik.imageUrl ? (
            <img
              src={tzaddik.imageUrl}
              alt={tzaddik.popularName}
              className="w-full object-cover object-top"
              style={{ aspectRatio: '4/3' }}
              loading="lazy"
            />
          ) : (
            <div
              className="w-full flex items-center justify-center bg-gradient-to-br from-navy to-navy-light"
              style={{ aspectRatio: '4/3' }}
            >
              <span className="font-heading text-5xl font-black text-white/15">
                {tzaddik.popularName?.trimStart().slice(0, 2) ?? '?'}
              </span>
            </div>
          )}
        </div>
        {/* Content */}
        <div className="p-3 flex flex-col flex-1 gap-1.5">
          <p className="font-heading text-sm font-bold text-navy leading-tight line-clamp-1">{tzaddik.popularName}</p>
          {tzaddik.biography && (
            <p className="text-xs text-text/60 leading-relaxed line-clamp-2">{tzaddik.biography}</p>
          )}
          <button
            onClick={() => setDeepenOpen(true)}
            className="mt-auto text-xs font-semibold text-gold hover:text-gold-dark transition"
          >
            קרא עוד ←
          </button>
        </div>

        <BottomSheet
          isOpen={deepenOpen}
          onClose={() => setDeepenOpen(false)}
          title={`📚 ${tzaddik.popularName}`}
        >
          <DeepenSheet tzaddik={tzaddik} />
        </BottomSheet>
      </article>
    )
  }

  return (
    <>
      <article dir="rtl" className="overflow-hidden rounded-2xl bg-white border border-gray-light shadow-sm">
        {/* ── Hero image ── */}
        <div className="relative">
          {tzaddik.imageUrl ? (
            <img
              src={tzaddik.imageUrl}
              alt={tzaddik.popularName}
              className="w-full object-cover object-top"
              style={{ aspectRatio: '4/5' }}
              loading="lazy"
            />
          ) : (
            <div
              className="w-full flex items-center justify-center bg-gradient-to-br from-navy to-navy-light"
              style={{ aspectRatio: '4/5' }}
            >
              <div className="text-center">
                <span className="font-heading text-8xl font-black text-white/10 block">
                  {tzaddik.popularName?.trimStart().slice(0, 2) ?? '?'}
                </span>
                <p className="text-white/20 text-xs mt-4">תמונה אותנטית טרם נמצאה</p>
              </div>
            </div>
          )}

          {/* Bottom gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Name overlay */}
          <div className="absolute inset-x-0 bottom-0 p-5">
            {tzaddik.stream || tzaddik.role ? (
              <div className="flex gap-1.5 mb-2">
                {tzaddik.stream && (
                  <span className="text-xs bg-white/15 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full font-medium">
                    {tzaddik.stream}
                  </span>
                )}
                {tzaddik.role && (
                  <span className="text-xs bg-white/15 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full font-medium">
                    {tzaddik.role}
                  </span>
                )}
              </div>
            ) : null}
            <h2 className="font-heading text-2xl font-black text-white leading-tight sm:text-3xl">
              {tzaddik.popularName}
            </h2>
            {tzaddik.fullName && (
              <p className="text-white/60 text-sm mt-0.5">{tzaddik.fullName}</p>
            )}
            {tzaddik.years && (
              <p className="text-white/40 text-xs mt-0.5">{tzaddik.years}</p>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-4 pt-4 pb-5 space-y-4">
          {/* Quote */}
          {tzaddik.quote && (
            <div className="border-r-4 border-gold pr-4 py-1">
              <p className="text-sm font-semibold leading-7 text-navy">{tzaddik.quote}</p>
            </div>
          )}

          {/* Tabs */}
          <TabsPrimitive.Root defaultValue="teaching" dir="rtl">
            <TabsPrimitive.List className="flex border-b border-gray-light">
              {TABS.map(({ value, label }) => (
                <TabsPrimitive.Trigger
                  key={value}
                  value={value}
                  className="flex-1 py-3 text-sm font-semibold text-navy/40 transition
                    data-[state=active]:border-b-2 data-[state=active]:border-gold
                    data-[state=active]:text-navy"
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
                  className="pt-3 min-h-[5rem] text-sm leading-7 text-text/75"
                >
                  {content
                    ? <p className="whitespace-pre-wrap">{content}</p>
                    : <span className="italic text-navy/30">{empty}</span>}
                </TabsPrimitive.Content>
              )
            })}
          </TabsPrimitive.Root>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-light">
            <button
              onClick={() => setLiked(toggleLiked(tzaddik.id))}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition ${
                liked
                  ? 'bg-navy text-cream'
                  : 'border border-gray-light text-navy/50 hover:border-navy/30 hover:text-navy'
              }`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              קראתי
            </button>

            <button
              onClick={() => shareTzaddik(tzaddik)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-light text-navy/50 text-sm font-semibold hover:border-navy/30 hover:text-navy transition"
            >
              <Share2 className="h-4 w-4" />
              שתף
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-light text-navy/50 text-sm font-semibold hover:border-navy/30 hover:text-navy transition"
            >
              <Copy className="h-4 w-4" />
              {copied ? 'הועתק ✓' : 'העתק'}
            </button>

            <button
              onClick={() => setDeepenOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-cream border border-gray-light text-navy text-sm font-semibold hover:bg-cream-dark transition mr-auto"
            >
              <BookOpen className="h-4 w-4 text-gold" />
              העמק בצדיק
            </button>
          </div>
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
