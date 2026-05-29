import { Sparkles } from 'lucide-react'
import type { DailySpark as DailySparkType } from '../../types'

interface DailySparkProps {
  spark: DailySparkType | null
}

export function DailySpark({ spark }: DailySparkProps) {
  return (
    <section className="rounded-[2rem] border border-indigo-100 bg-indigo-50/70 p-6 shadow-sm dark:border-indigo-900/40 dark:bg-indigo-950/20">
      <div className="flex items-center gap-3 text-right">
        <Sparkles className="h-6 w-6 text-indigo-700 dark:text-indigo-300" />
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">הניצוץ היומי</h2>
          {spark ? (
            <>
              <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{spark.content}</p>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{spark.source}{spark.relatedTo ? ` • ${spark.relatedTo}` : ''}</p>
            </>
          ) : (
            <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">אין ניצוץ זמין ליום זה.</p>
          )}
        </div>
      </div>
    </section>
  )
}
