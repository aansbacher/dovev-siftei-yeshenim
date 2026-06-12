interface HebrewDateBlockProps {
  hebrewDateDisplay: string
  parasha: string
  gregorianDate: Date
  totalTzaddikim: number
}

export function HebrewDateBlock({ hebrewDateDisplay, parasha, gregorianDate, totalTzaddikim }: HebrewDateBlockProps) {
  const formattedGregorian = gregorianDate.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-bl from-indigo-700 via-violet-700 to-purple-800 p-5 shadow-lg sm:p-6">
      {/* decorative background circles */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/5" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-200/80">יום זיכרון</p>
          <h2 className="mt-1 font-heading text-4xl font-black leading-tight text-white sm:text-5xl">
            {hebrewDateDisplay}
          </h2>
          <p className="mt-1.5 text-sm text-indigo-200/70">{formattedGregorian}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {parasha}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-indigo-100">
              {totalTzaddikim} צדיקים
            </span>
          </div>
        </div>

        {/* decorative Hebrew letter */}
        <span
          aria-hidden
          className="select-none font-heading text-[6rem] font-black leading-none text-white/8 sm:text-[7rem]"
          style={{ lineHeight: 1 }}
        >
          ✦
        </span>
      </div>
    </section>
  )
}
