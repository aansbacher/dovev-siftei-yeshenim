import { Link } from 'react-router-dom'
import type { DailySpark as DailySparkType } from '../types'
import { getHebrewDate } from '../lib/hebrewDate'
import { DailySpark } from '../components/today/DailySpark'

const placeholderSpark: DailySparkType = {
  id: 1,
  content: 'הניצוץ המלא מגיע עם חיבור קצר ועמוק ליום הזה, כדי להאיר את הדרך ברגעים פשוטים.',
  source: 'גליון דיגיטלי',
  relatedTo: 'צדיקי היום',
}

export function Spark() {
  const hebrew = getHebrewDate(new Date())

  return (
    <div className="grid gap-8 pb-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex flex-col gap-4 text-right">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">הניצוץ היומי</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">ניצוץ מלא</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{hebrew.hebrewDay} {hebrew.hebrewMonth} • {hebrew.parasha}</p>
        </div>
      </section>
      <DailySpark spark={placeholderSpark} />
      <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
        <p className="text-right text-sm leading-7 text-slate-600 dark:text-slate-300">
          כאן תוכלו לשתף את הניצוץ עם חברים, לשמור לחיזוק יומי ולחזור למקורות.
        </p>
        <Link to="/today" className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500">
          חזור לגליון היום
        </Link>
      </div>
    </div>
  )
}
