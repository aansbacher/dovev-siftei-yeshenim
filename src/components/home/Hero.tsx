import { Link } from 'react-router-dom'
import { Mail, Sparkles } from 'lucide-react'

export function Hero() {
  return (
    <section className="rounded-[2rem] bg-white/90 p-6 shadow-lg shadow-slate-200/70 ring-1 ring-slate-200 dark:bg-slate-900/95 dark:ring-slate-800 sm:p-10">
      <div className="flex flex-col gap-8 text-center rtl:text-right">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
            <Sparkles className="h-4 w-4" /> גליון יומי של השראה
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
            דובב שפתי ישנים
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
            סיפור אחד. וורט אחד. רגע של השראה בכל יום.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/today"
            className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            כניסה לגליון
          </Link>
          <a
            href="#subscribe"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <Mail className="ml-2 h-4 w-4" />
            הירשם לדיוור יומי
          </a>
        </div>
      </div>
    </section>
  )
}
