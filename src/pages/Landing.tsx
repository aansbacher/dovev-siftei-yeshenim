import { Link } from 'react-router-dom'
import { BookOpen, ArrowLeft } from 'lucide-react'
import { getHebrewDate } from '../lib/hebrewDate'
import { SubscribeForm } from '../components/subscribe/SubscribeForm'

/** Warm, representative home: brand hero, a short teaser that leads to the About page. */
export function Landing() {
  const hebrew = getHebrewDate(new Date())

  return (
    <div className="grid gap-5 pb-6">
      {/* ── Brand hero ── */}
      <section className="relative overflow-hidden rounded-[26px] border border-rule shadow-[0_14px_40px_-16px_var(--shadow)] bg-surface">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: 'radial-gradient(120% 90% at 50% -10%, #FCEFD6 0%, #EEF0FD 42%, #FFFFFF 78%)' }}
        />
        <div className="relative px-6 pt-8 pb-7 text-center flex flex-col items-center">
          <HeroArt />
          <p className="mt-1 text-[12.5px] font-semibold tracking-[0.12em] text-gold">דּוֹבֵב שִׂפְתֵי יְשֵׁנִים</p>
          <h1 className="font-display text-[32px] leading-tight text-ink mt-1.5">קדושים בכל יום</h1>
          <p className="mt-2.5 text-[14px] text-ink-soft max-w-[20rem] leading-relaxed">
            מסע יומי אל אור הצדיקים. בכל יום, סיפור ופנינה מתורתו של בעל ההילולא של היום.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-2 px-4 py-1.5 text-[13px] font-semibold text-ink-soft">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            היום, {hebrew.hebrewDateDisplay}
          </div>

          <Link
            to="/today"
            className="mt-5 w-full max-w-xs inline-flex items-center justify-center gap-2 rounded-full bg-gold text-white font-bold text-[15px] py-3.5 shadow-[0_10px_24px_-8px_rgba(91,118,229,.65)] hover:bg-gold-deep transition active:scale-[.99]"
          >
            <BookOpen className="w-[18px] h-[18px]" />
            לגיליון של היום
          </Link>
        </div>
      </section>

      {/* ── Short "why" teaser → About ── */}
      <Link
        to="/about"
        className="group relative overflow-hidden rounded-[22px] bg-surface border border-rule shadow-[0_8px_24px_-14px_var(--shadow)] px-6 py-6 hover:border-gold/40 transition active:scale-[0.99]"
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: 'radial-gradient(120% 80% at 50% -20%, #FCEFD6 0%, transparent 62%)' }}
        />
        <div className="relative">
          <h2 className="font-display text-[19px] text-ink leading-tight">למה מזכירים את הצדיקים?</h2>
          <p className="text-[14.5px] leading-[1.9] text-ink-soft mt-2">
            כשלומדים את תורתם של הצדיקים ואומרים אותה, שפתותיהם רוחשות בקבר. אנו מדובבים את שפתיהם,
            וזו מעלה גדולה להם ולנו.
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-gold-deep group-hover:gap-2.5 transition-all">
            קראו על הרעיון שמאחורי האתר
            <ArrowLeft className="w-4 h-4" />
          </span>
        </div>
      </Link>

      {/* ── Secondary link to today ── */}
      <Link
        to="/today"
        className="flex items-center justify-between rounded-[22px] bg-surface border border-rule px-5 py-4 shadow-[0_8px_24px_-14px_var(--shadow)] hover:border-gold/40 transition active:scale-[0.99]"
      >
        <div>
          <p className="font-bold text-ink text-[15px]">הצדיק של היום</p>
          <p className="text-[13px] text-muted mt-0.5">גלו את בעלי ההילולא של כל יום בשנה</p>
        </div>
        <ArrowLeft className="w-5 h-5 text-gold" />
      </Link>

      <SubscribeForm />
    </div>
  )
}

/** Dreamy inline illustration: light rising from an open book, with sparkles. */
function HeroArt() {
  return (
    <svg width="188" height="150" viewBox="0 0 188 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <radialGradient id="glow" cx="50%" cy="38%" r="55%">
          <stop offset="0%" stopColor="#FBE6BE" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#F3D9A6" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#F3D9A6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ray" x1="94" y1="20" x2="94" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E7B85C" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#E7B85C" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="pageR" x1="94" y1="86" x2="150" y2="128" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#DDE4FB" />
        </linearGradient>
        <linearGradient id="pageL" x1="94" y1="86" x2="38" y2="128" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E6EAFC" />
        </linearGradient>
      </defs>
      <circle cx="94" cy="60" r="74" fill="url(#glow)" />
      <g opacity="0.9">
        <path d="M94 84 L86 26 L102 26 Z" fill="url(#ray)" />
        <path d="M94 84 L64 34 L78 30 Z" fill="url(#ray)" opacity="0.6" />
        <path d="M94 84 L124 34 L110 30 Z" fill="url(#ray)" opacity="0.6" />
      </g>
      <g fill="#E7B85C">
        <path d="M70 26 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 z" opacity="0.9" />
        <path d="M124 22 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 z" opacity="0.8" />
        <circle cx="98" cy="16" r="2" opacity="0.85" />
        <circle cx="60" cy="48" r="1.6" opacity="0.6" />
        <circle cx="132" cy="50" r="1.6" opacity="0.6" />
      </g>
      <g>
        <path d="M94 88 C78 78 56 78 34 84 L34 126 C56 120 78 120 94 128 Z" fill="url(#pageL)" stroke="#C9D2F2" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M94 88 C110 78 132 78 154 84 L154 126 C132 120 110 120 94 128 Z" fill="url(#pageR)" stroke="#C9D2F2" strokeWidth="1.5" strokeLinejoin="round" />
        <g stroke="#B9C3EC" strokeWidth="1.4" strokeLinecap="round" opacity="0.8">
          <line x1="46" y1="94" x2="82" y2="90" />
          <line x1="46" y1="101" x2="82" y2="97" />
          <line x1="46" y1="108" x2="82" y2="104" />
          <line x1="106" y1="90" x2="142" y2="94" />
          <line x1="106" y1="97" x2="142" y2="101" />
          <line x1="106" y1="104" x2="142" y2="108" />
        </g>
      </g>
    </svg>
  )
}
