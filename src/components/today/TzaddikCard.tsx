import { useState } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { Share2, User, Heart, ChevronDown, ChevronUp } from 'lucide-react'
import type { Tzaddik } from '../../types'
import { Button } from '../ui/button'

const PREVIEW_WORDS = 80

function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const words = text.trim().split(/\s+/)
  const isLong = words.length > PREVIEW_WORDS

  const preview = isLong
    ? (() => {
        const candidate = words.slice(0, PREVIEW_WORDS).join(' ')
        const lastEnd = Math.max(
          candidate.lastIndexOf('. '),
          candidate.lastIndexOf('! '),
          candidate.lastIndexOf('? '),
        )
        return lastEnd > candidate.length * 0.4
          ? candidate.slice(0, lastEnd + 1)
          : candidate
      })()
    : text

  return (
    <div>
      <p className="whitespace-pre-wrap leading-7">{expanded || !isLong ? text : preview + '…'}</p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
        >
          {expanded ? (
            <><ChevronUp className="h-3 w-3" />קרא פחות</>
          ) : (
            <><ChevronDown className="h-3 w-3" />קרא עוד</>
          )}
        </button>
      )}
    </div>
  )
}

interface TzaddikCardProps {
  tzaddik: Tzaddik
}

type ContentKey = 'story' | 'torah' | 'biography'
const TABS: { value: string; label: string; key: ContentKey; empty: string }[] = [
  { value: 'story',    label: 'סיפור',  key: 'story',     empty: 'אין סיפור זמין' },
  { value: 'teaching', label: 'מתורתו', key: 'torah',     empty: 'אין תורה זמינה' },
  { value: 'bio',      label: 'רקע',    key: 'biography', empty: 'אין רקע זמין' },
]

export function TzaddikCard({ tzaddik }: TzaddikCardProps) {
  const [liked, setLiked] = useState(false)

  return (
    <article
      dir="rtl"
      className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
    >
      {/* ── Hero ── */}
      <div className="relative">
        {tzaddik.imageUrl ? (
          <img
            src={tzaddik.imageUrl}
            alt={tzaddik.popularName}
            className="h-56 w-full object-cover object-top sm:h-64"
            loading="lazy"
          />
        ) : (
          <div className="flex h-56 items-center justify-center bg-gradient-to-br from-violet-100 via-fuchsia-100 to-rose-100 sm:h-64 dark:from-violet-950/40 dark:via-fuchsia-950/30 dark:to-rose-950/20">
            <User className="h-24 w-24 text-indigo-200 dark:text-indigo-900" />
          </div>
        )}

        {/* Bottom gradient + name overlay */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-xl font-bold leading-tight text-white sm:text-2xl">{tzaddik.popularName}</p>
          {tzaddik.years && <p className="mt-0.5 text-sm text-white/70">{tzaddik.years}</p>}
        </div>

        {/* Badges – top right (RTL start) */}
        {(tzaddik.stream || tzaddik.role) && (
          <div className="absolute right-3 top-3 flex flex-wrap gap-1.5">
            {tzaddik.stream && (
              <span className="rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold text-slate-800 backdrop-blur-sm">
                {tzaddik.stream}
              </span>
            )}
            {tzaddik.role && (
              <span className="rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold text-slate-800 backdrop-blur-sm">
                {tzaddik.role}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="space-y-4 p-4 sm:p-5">
        {/* Full name */}
        {tzaddik.fullName && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{tzaddik.fullName}</p>
        )}

        {/* Quote */}
        {tzaddik.quote && (
          <div className="rounded-2xl bg-indigo-50 px-4 py-3 dark:bg-indigo-500/10">
            <p className="text-sm font-semibold leading-relaxed text-indigo-900 dark:text-indigo-200">
              ״{tzaddik.quote}״
            </p>
          </div>
        )}

        {/* Tabs */}
        <TabsPrimitive.Root defaultValue="bio" dir="rtl" className="space-y-3">
          <TabsPrimitive.List className="flex rounded-full bg-slate-100 p-1 dark:bg-slate-900/80">
            {TABS.map(({ value, label }) => (
              <TabsPrimitive.Trigger
                key={value}
                value={value}
                className="flex-1 rounded-full py-2 text-sm font-semibold text-slate-600 transition data-[state=active]:bg-accent data-[state=active]:text-white dark:text-slate-300"
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
                className="min-h-[4rem] text-sm text-slate-600 dark:text-slate-300"
              >
                {content
                  ? <ExpandableText text={content} />
                  : <span className="italic text-slate-400">{empty}</span>}
              </TabsPrimitive.Content>
            )
          })}
        </TabsPrimitive.Root>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <Button
            variant={liked ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setLiked(!liked)}
            className={liked ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}
          >
            <Heart className={`ml-2 h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            קראתי
          </Button>
          <Button variant="secondary" size="sm">
            <Share2 className="ml-2 h-4 w-4" />
            שתף
          </Button>
          {tzaddik.sources && tzaddik.sources.length > 0 && (
            <div className="flex flex-1 flex-wrap justify-end gap-1.5">
              {tzaddik.sources.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
