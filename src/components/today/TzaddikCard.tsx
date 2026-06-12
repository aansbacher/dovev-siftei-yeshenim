import { useState } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { Share2, Heart, ChevronDown, ChevronUp } from 'lucide-react'
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
  { value: 'bio',      label: 'רקע',    key: 'biography', empty: 'אין רקע זמין' },
  { value: 'teaching', label: 'מתורתו', key: 'torah',     empty: 'אין תורה זמינה' },
  { value: 'story',    label: 'סיפור',  key: 'story',     empty: 'אין סיפור זמין' },
]

export function TzaddikCard({ tzaddik }: TzaddikCardProps) {
  const [liked, setLiked] = useState(false)

  return (
    <article
      dir="rtl"
      className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-md transition-shadow hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
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
          <div className="relative flex h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 sm:h-64">
            {/* decorative circles */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/5" />
            <span className="relative select-none font-heading text-8xl font-black leading-none text-white/20 sm:text-9xl">
              {tzaddik.popularName?.trimStart().slice(0, 2) ?? '?'}
            </span>
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
          <div className="relative rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 px-5 py-4 dark:from-indigo-950/50 dark:to-violet-950/40">
            <span aria-hidden className="pointer-events-none absolute right-3 top-0 select-none font-serif text-6xl leading-none text-indigo-200 dark:text-indigo-800">
              ״
            </span>
            <p className="relative text-sm font-semibold leading-7 text-indigo-900 dark:text-indigo-100">
              {tzaddik.quote}
            </p>
          </div>
        )}

        {/* Tabs */}
        <TabsPrimitive.Root defaultValue="bio" dir="rtl" className="space-y-3">
          <TabsPrimitive.List className="flex border-b border-slate-200 dark:border-slate-700">
            {TABS.map(({ value, label }) => (
              <TabsPrimitive.Trigger
                key={value}
                value={value}
                className="flex-1 pb-2.5 pt-1 text-sm font-semibold text-slate-400 transition
                  data-[state=active]:border-b-2 data-[state=active]:border-accent
                  data-[state=active]:text-accent
                  dark:text-slate-500 dark:data-[state=active]:text-indigo-400"
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
                className="min-h-[4rem] text-sm leading-7 text-slate-600 dark:text-slate-300"
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
