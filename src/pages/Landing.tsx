import { Hero } from '../components/home/Hero'
import { SubscribeForm } from '../components/subscribe/SubscribeForm'
import { Link } from 'react-router-dom'

export function Landing() {
  return (
    <div className="grid gap-5 pb-10">
      {/* Desktop: hero + about side by side / Mobile: stacked */}
      <div className="grid gap-5 lg:grid-cols-[1fr,1fr] lg:items-start">
        <Hero />

        {/* About section */}
        <section className="rounded-2xl bg-white border border-gray-light px-5 py-6 shadow-sm h-full">
          <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-3">אודות</p>
          <h2 className="font-heading text-xl font-black text-navy leading-snug mb-4">
            למה דובב שפתי ישנים?
          </h2>
          <p className="text-sm leading-7 text-text/70">
            בכל יום נפטרו צדיקים, רבנים וגדולי ישראל שהאירו את העולם בתורתם, במעשיהם ובמידותיהם.
          </p>
          <p className="text-sm leading-7 text-text/70 mt-3">
            מטרת האתר היא לדובב שפתי ישנים, להנגיש בכל יום מסר קצר, סיפור ותורה מבעלי ההילולה של אותו היום.
          </p>
          <p className="text-sm leading-7 text-text/70 mt-3">
            כך יכול כל יהודי להתחבר מדי יום למסורת ישראל, לחכמת הדורות ולצדיקי האמת.
          </p>

          {/* Values */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: '📜', title: 'מקור מאומת', desc: 'רק ממקורות אמינים' },
              { icon: '✍️', title: 'כתיבה אנושית', desc: 'לא תוכן אוטומטי' },
              { icon: '✅', title: 'אישור עורך', desc: 'כל תוכן עבר בדיקה' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center p-3 rounded-xl bg-cream/60">
                <span className="text-xl">{icon}</span>
                <p className="text-xs font-bold text-navy mt-1.5 leading-tight">{title}</p>
                <p className="text-xs text-navy/40 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* CTA Banner */}
      <Link
        to="/today"
        className="flex items-center justify-between rounded-2xl bg-cream border border-gray-light px-5 py-4 shadow-sm hover:bg-cream-dark transition active:scale-[0.99]"
      >
        <div>
          <p className="font-bold text-navy text-base">קדושים בכל יום</p>
          <p className="text-sm text-navy/50 mt-0.5">הכנסו לגליון של היום</p>
        </div>
        <span className="text-2xl text-gold">←</span>
      </Link>

      {/* Subscribe */}
      <SubscribeForm />
    </div>
  )
}
