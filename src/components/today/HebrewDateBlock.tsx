interface HebrewDateBlockProps {
  hebrewDateDisplay: string
  parasha: string
  gregorianDate: Date
  totalTzaddikim: number
}

export function HebrewDateBlock({ hebrewDateDisplay, parasha, gregorianDate, totalTzaddikim }: HebrewDateBlockProps) {
  const formattedGregorian = `${gregorianDate.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}`

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/80 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">היום</p>
          <div className="mt-2 flex items-end gap-3">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">{hebrewDateDisplay}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formattedGregorian}</p>
            </div>
            <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200 whitespace-nowrap">
              {parasha}
            </div>
          </div>
        </div>
        <p className="rounded-full bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300 whitespace-nowrap">
          {totalTzaddikim} צדיקים
        </p>
      </div>
    </section>
  )
}
