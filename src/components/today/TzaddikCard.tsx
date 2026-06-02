import { useState } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { Bookmark, Share2, User, Heart, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import type { Tzaddik } from '../../types'
import { Badge } from '../ui/badge'
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
      <p className="whitespace-pre-wrap leading-7">
        {expanded || !isLong ? text : preview + '…'}
      </p>
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

export function TzaddikCard({ tzaddik }: TzaddikCardProps) {
  const [liked, setLiked] = useState(false)
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
      <div className="relative overflow-hidden rounded-t-[2rem] bg-gradient-to-r from-violet-100 via-fuchsia-100 to-rose-100 p-5 dark:from-violet-950/40 dark:via-fuchsia-950/30 dark:to-rose-950/20">
        <Bookmark className="absolute left-5 top-5 h-6 w-6 text-indigo-600" />
        <div className="flex flex-col gap-3 text-right">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge>{tzaddik.stream}</Badge>
              <Badge>{tzaddik.role}</Badge>
            </div>
          </div>
          <div className="mx-auto flex h-48 w-48 items-center justify-center overflow-hidden rounded-3xl bg-slate-100 text-slate-500 dark:bg-slate-800">
            {tzaddik.imageUrl ? (
              <img src={tzaddik.imageUrl} alt={tzaddik.popularName} className="h-full w-full object-cover" />
            ) : (
              <User className="h-16 w-16" />
            )}
          </div>
          <div className="space-y-2 text-right">
            <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{tzaddik.popularName}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{tzaddik.fullName}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{tzaddik.years}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4 text-right text-sm leading-6 text-slate-600 dark:bg-slate-900/80 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-slate-100">“{tzaddik.quote}”</p>
          </div>
        </div>
      </div>
      <div className="p-5">
        <TabsPrimitive.Root defaultValue="bio" className="space-y-4" dir="rtl">
          <TabsPrimitive.List className="flex flex-wrap gap-2 rounded-full bg-slate-100 p-2 dark:bg-slate-900/80 justify-start">
            {[
              { value: 'story', label: 'סיפור' },
              { value: 'teaching', label: 'מתורתו' },
              { value: 'bio', label: 'רקע עליו' }
            ].map(({ value, label }) => (
              <TabsPrimitive.Trigger
                key={value}
                value={value}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition data-[state=active]:bg-accent data-[state=active]:text-white dark:text-slate-300"
              >
                {label}
              </TabsPrimitive.Trigger>
            ))}
          </TabsPrimitive.List>
          <TabsPrimitive.Content value="story" className="text-sm text-slate-600 dark:text-slate-300">
            {tzaddik.story
              ? <ExpandableText text={tzaddik.story} />
              : <span className="text-slate-400 italic">אין סיפור זמין</span>}
          </TabsPrimitive.Content>
          <TabsPrimitive.Content value="teaching" className="text-sm text-slate-600 dark:text-slate-300">
            {tzaddik.torah
              ? <ExpandableText text={tzaddik.torah} />
              : <span className="text-slate-400 italic">אין תורה זמינה</span>}
          </TabsPrimitive.Content>
          <TabsPrimitive.Content value="bio" className="text-sm text-slate-600 dark:text-slate-300">
            {tzaddik.biography
              ? <ExpandableText text={tzaddik.biography} />
              : <span className="text-slate-400 italic">אין רקע זמין</span>}
          </TabsPrimitive.Content>
        </TabsPrimitive.Root>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex gap-2">
            <Button 
              variant={liked ? "primary" : "secondary"}
              size="sm"
              onClick={() => setLiked(!liked)}
              className={liked ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""}
            >
              <Heart className={`ml-2 h-4 w-4 ${liked ? "fill-current" : ""}`} />
              קראתי
            </Button>
            <Button variant="secondary" size="sm">
              <Plus className="ml-2 h-4 w-4" />
              הוסף משלך
            </Button>
          </div>
          <Button variant="secondary" size="sm">
            <Share2 className="ml-2 h-4 w-4" />
            שתף
          </Button>
          <div className="flex flex-wrap gap-2">
            {tzaddik.sources?.map((source) => (
              <span key={source} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {source}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
