import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { subscribeUser } from '../../lib/queries'
import type { Subscriber } from '../../types'

export function SubscribeForm() {
  const [form, setForm] = useState({
    email: '',
    phone: '',
    viaEmail: true,
    viaWhatsapp: false,
  })
  const [message, setMessage] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async (subscriber: Subscriber) => subscribeUser(subscriber),
    onSuccess: () => {
      setMessage('תודה! ההרשמה נקלטה בהצלחה.')
      setForm({ email: '', phone: '', viaEmail: true, viaWhatsapp: false })
    },
    onError: () => {
      setMessage('אירעה שגיאה. נסו שוב מאוחר יותר.')
    },
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.viaEmail && !form.viaWhatsapp) {
      setMessage('בחרו לפחות דרך אחת לקבלת דיוור.')
      return
    }
    mutation.mutate({
      email: form.email,
      phone: form.phone || undefined,
      viaEmail: form.viaEmail,
      viaWhatsapp: form.viaWhatsapp,
    })
  }

  return (
    <section
      id="subscribe"
      className="dsy-card relative overflow-hidden rounded-md bg-surface border border-rule shadow-[0_18px_40px_-30px_var(--shadow)] px-5 py-8 sm:px-8 text-center"
    >
      <span className="dsy-cor tl" /><span className="dsy-cor tr" /><span className="dsy-cor bl" /><span className="dsy-cor br" />

      <div className="relative z-[1] max-w-lg mx-auto">
        <div className="text-[11px] tracking-[3px] font-bold text-gold mb-2">הִצְטָרְפוּ</div>
        <h2 className="font-display font-bold text-ink text-2xl sm:text-[25px] mb-1.5">
          קבלו את גיליון הצדיקים מדי יום
        </h2>
        <p className="text-[13px] text-muted mb-5">
          מסר קצר, סיפור ותורה מבעלי ההילולה, ישירות למייל או לוואטסאפ.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="כתובת אימייל"
              className="flex-1 rounded-lg bg-surface-2 border border-rule px-4 py-3 text-sm text-ink placeholder:text-muted outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
              dir="rtl"
            />
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="וואטסאפ (אופציונלי)"
              className="flex-1 rounded-lg bg-surface-2 border border-rule px-4 py-3 text-sm text-ink placeholder:text-muted outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
              dir="rtl"
            />
          </div>

          <div className="flex items-center justify-center gap-2">
            {[
              { key: 'viaEmail' as const, label: '📧 מייל' },
              { key: 'viaWhatsapp' as const, label: '💬 וואטסאפ' },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setForm({ ...form, [key]: !form[key] })}
                className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition border ${
                  form[key]
                    ? 'bg-gold text-white border-gold'
                    : 'bg-surface-2 text-ink-soft border-rule hover:border-gold/50'
                }`}
              >
                {label}
              </button>
            ))}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-full bg-ink text-ground px-7 py-2 text-sm font-bold transition hover:opacity-90 disabled:opacity-60 active:scale-[0.99]"
            >
              {mutation.isPending ? 'שולח...' : 'הרשמה'}
            </button>
          </div>

          {message && (
            <p className={`text-sm ${message.includes('תודה') ? 'text-success' : 'text-red-500'}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  )
}
