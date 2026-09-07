import { Link } from 'react-router-dom'
import { BookOpen, ArrowLeft } from 'lucide-react'
import { getHebrewDate } from '../lib/hebrewDate'
import { SubscribeForm } from '../components/subscribe/SubscribeForm'

/** Warm, inviting home screen: greeting + dreamy hero + "where you arrived". */
export function Landing() {
  const hebrew = getHebrewDate(new Date())

  return (
    <div className="grid gap-5 pb-6">
      {/* ── Warm hero greeting ── */}
      <section className="relative overflow-hidden rounded-[26px] border border-rule shadow-[0_14px_40px_-16px_var(--shadow)] bg-surface">
        {/* soft glowing gradient */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% -10%, #FCEFD6 0%, #EEF0FD 42%, #FFFFFF 78%)',
          }}
        />
        <div className="relative px-6 pt-8 pb-7 text-center flex flex-col items-center">
          <HeroArt />
          <p className="mt-1 text-[13px] font-semibold tracking-wide text-gold">ברוכים הבאים</p>
          <h1 className="font-display text-[30px] leading-tight text-ink mt-1">דובב שפתי ישנים</h1>
          <p className="mt-2 text-[14px] text-ink-soft max-w-[19rem] leading-relaxed">
            מסע יומי קטן אל אור הצדיקים, סיפור ותורה מבעל ההילולה של היום.
          </p>

          {/* today's date pill */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-2 px-4 py-1.5 text-[13px] font-semibold text-ink-soft">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            היום, {hebrew.hebrewDateDisplay}
          </div>

          {/* CTA */}
          <Link
            to="/today"
            className="mt-5 w-full max-w-xs inline-flex items-center justify-center gap-2 rounded-full bg-gold text-white font-bold text-[15px] py-3.5 shadow-[0_10px_24px_-8px_rgba(91,118,229,.65)] hover:bg-gold-deep transition active:scale-[.99]"
          >
            <BookOpen className="w-[18px] h-[18px]" />
            לגיליון של היום
          </Link>
        </div>
      </section>

      {/* ── Where you arrived ── */}
      <section className="rounded-[22px] bg-surface border border-rule shadow-[0_8px_24px_-14px_var(--shadow)] px-6 py-6">
        <h2 className="font-display text-[19px] text-ink mb-2.5">לאן הגעת?</h2>
        <p className="text-[14.5px] leading-[1.85] text-ink-soft">
          בכל יום בשנה מציינים את יום ההילולה של צדיקים וגדולי ישראל שהאירו את העולם בתורתם ובמעשיהם.
          כאן, בכל יום מחדש, תפגשו את בעל ההילולה של היום, סיפור נוגע ללב, פנינה מתורתו ואמרה שנשארת בלב.
        </p>
        <p className="text-[14.5px] leading-[1.85] text-ink-soft mt-3">
          כמה דקות ביום, להתחבר למסורת, לחכמת הדורות ולצדיקי האמת.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {[
            { title: 'מאומת', desc: 'רק ממקורות אמינים' },
            { title: 'אנושי', desc: 'נכתב בקפידה, לא אוטומט' },
            { title: 'קצר ונעים', desc: 'כמה דקות ביום' },
          ].map(({ title, desc }) => (
            <div key={title} className="text-center px-2 py-3 rounded-2xl bg-surface-2">
              <p className="text-[13px] font-bold text-ink leading-tight">{title}</p>
              <p className="text-[11px] text-muted mt-1 leading-tight">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* secondary link to today */}
      <Link
        to="/today"
        className="flex items-center justify-between rounded-[22px] bg-surface border border-rule px-5 py-4 shadow-[0_8px_24px_-14px_var(--shadow)] hover:border-gold/40 transition active:scale-[0.99]"
      >
        <div>
          <p className="font-bold text-ink text-[15px]">קדושים בכל יום</p>
          <p className="text-[13px] text-muted mt-0.5">גלו את בעלי ההילולה של כל יום בשנה</p>
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

      {/* warm halo */}
      <circle cx="94" cy="60" r="74" fill="url(#glow)" />

      {/* rising light rays */}
      <g opacity="0.9">
        <path d="M94 84 L86 26 L102 26 Z" fill="url(#ray)" />
        <path d="M94 84 L64 34 L78 30 Z" fill="url(#ray)" opacity="0.6" />
        <path d="M94 84 L124 34 L110 30 Z" fill="url(#ray)" opacity="0.6" />
      </g>

      {/* sparkles */}
      <g fill="#E7B85C">
        <path d="M70 26 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 z" opacity="0.9" />
        <path d="M124 22 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 z" opacity="0.8" />
        <circle cx="98" cy="16" r="2" opacity="0.85" />
        <circle cx="60" cy="48" r="1.6" opacity="0.6" />
        <circle cx="132" cy="50" r="1.6" opacity="0.6" />
      </g>

      {/* open book */}
      <g>
        <path d="M94 88 C78 78 56 78 34 84 L34 126 C56 120 78 120 94 128 Z" fill="url(#pageL)" stroke="#C9D2F2" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M94 88 C110 78 132 78 154 84 L154 126 C132 120 110 120 94 128 Z" fill="url(#pageR)" stroke="#C9D2F2" strokeWidth="1.5" strokeLinejoin="round" />
        {/* text lines */}
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
