import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { useI18n } from '../lib/i18n'

/** Full explanation of the project: the name, the maalah, the hilula, what we do. */
export function About() {
  const { t, dir } = useI18n()
  return (
    <div className="grid gap-5 pb-8" dir={dir}>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-[26px] border border-rule shadow-[0_14px_40px_-16px_var(--shadow)] bg-surface">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: 'radial-gradient(120% 90% at 50% -10%, #FCEFD6 0%, #EEF0FD 45%, #FFFFFF 80%)' }}
        />
        <div className="relative px-6 pt-9 pb-8 text-center">
          <p className="text-[12.5px] font-semibold tracking-wide text-gold">{t.ab_eyebrow}</p>
          <h1 className="font-display text-[30px] leading-tight text-ink mt-1.5">{t.brand}</h1>
          <p className="mt-3 text-[14.5px] text-ink-soft max-w-[21rem] mx-auto leading-relaxed">
            {t.ab_heroBody}
          </p>
        </div>
      </section>

      {/* ── The name ── */}
      <section className="rounded-[22px] bg-surface border border-rule shadow-[0_8px_24px_-14px_var(--shadow)] px-6 py-7">
        <p className="text-[12.5px] font-semibold tracking-wide text-gold">{t.ab_nameEyebrow}</p>
        <h2 className="font-display text-[22px] text-ink mt-1 leading-tight">{t.subBrand}</h2>
        <p className="text-[12px] text-muted mt-1">{t.ab_nameVerse}</p>

        <p className="text-[15px] leading-[1.95] text-ink-soft mt-4">
          {t.ab_nameBody}
        </p>

        <div className="mt-5 rounded-2xl bg-surface-2 px-5 py-4 text-center">
          <p className="text-[15px] leading-[1.95] text-ink">
            {t.ab_talmud}
          </p>
          <p className="text-[12px] text-muted mt-2">{t.ab_talmudSrc}</p>
        </div>

        <p className="text-[15px] leading-[1.95] text-ink-soft mt-5">
          {t.ab_nameBody2}
        </p>
      </section>

      {/* ── Hilula ── */}
      <section className="rounded-[22px] bg-surface border border-rule shadow-[0_8px_24px_-14px_var(--shadow)] px-6 py-7">
        <h2 className="font-display text-[20px] text-ink leading-tight">{t.ab_hilulaTitle}</h2>
        <p className="text-[15px] leading-[1.95] text-ink-soft mt-3">
          {t.ab_hilulaBody1}
        </p>
        <p className="text-[15px] leading-[1.95] text-ink-soft mt-3">
          {t.ab_hilulaBody2}
        </p>
      </section>

      {/* ── What you'll find ── */}
      <section className="rounded-[22px] bg-surface border border-rule shadow-[0_8px_24px_-14px_var(--shadow)] px-6 py-7">
        <h2 className="font-display text-[20px] text-ink leading-tight">{t.ab_findTitle}</h2>
        <div className="mt-4 space-y-3">
          {t.ab_find.map(([title, d]) => (
            <div key={title} className="flex gap-3.5 items-start">
              <span className="mt-1.5 shrink-0 h-2 w-2 rounded-full bg-gold" />
              <div>
                <p className="font-bold text-ink text-[15px] leading-snug">{title}</p>
                <p className="text-[13.5px] text-ink-soft mt-0.5 leading-relaxed">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Our commitment ── */}
      <section className="rounded-[22px] bg-warm-soft border border-[color:var(--warm-line)] px-6 py-6">
        <h2 className="font-display text-[19px] text-ink leading-tight">{t.ab_commitTitle}</h2>
        <p className="text-[14.5px] leading-[1.9] text-ink-soft mt-2.5">
          {t.ab_commitBody}
        </p>
      </section>

      {/* ── CTA ── */}
      <Link
        to="/today"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-gold text-white font-bold text-[15px] py-3.5 shadow-[0_10px_24px_-8px_rgba(180,119,42,.5)] hover:bg-gold-deep transition active:scale-[.99]"
      >
        <BookOpen className="w-[18px] h-[18px]" />
        {t.ctaToday}
      </Link>
    </div>
  )
}
