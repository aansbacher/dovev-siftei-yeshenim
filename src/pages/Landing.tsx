import { Hero } from '../components/home/Hero'
import { Methodology } from '../components/home/Methodology'
import { SubscribeForm } from '../components/subscribe/SubscribeForm'

export function Landing() {
  return (
    <div className="grid gap-10 pb-10">
      <Hero />
      <section className="grid gap-6 rounded-[2rem] bg-white/90 p-6 shadow-sm shadow-slate-200/70 dark:bg-slate-950/90 dark:shadow-slate-800/60 sm:p-10">
        <div className="text-right">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">השיטה שלנו</p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            כל גליון מתמקד בהשראה קצרה, בהקשר צדיקי ובהקפדה על תוכן אמין ונעים לקריאה.
          </p>
        </div>
        <Methodology />
      </section>
      <SubscribeForm />
    </div>
  )
}
