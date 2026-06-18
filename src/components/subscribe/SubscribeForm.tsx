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
    <section id="subscribe" className="rounded-2xl bg-navy px-5 py-6 shadow-sm">
      <p className="text-xs font-semibold text-gold/80 uppercase tracking-widest mb-1">הירשם</p>
      <h2 className="font-heading text-lg font-bold text-cream mb-1">
        קבל את דברי הצדיקים בכל יום
      </h2>
      <p className="text-sm text-cream/50 mb-5">ישירות למייל או לוואטסאפ</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-cream/60 mb-1.5">אימייל</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="your@email.com"
            className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-sm text-cream placeholder-cream/30 outline-none transition focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-cream/60 mb-1.5">
            טלפון וואטסאפ <span className="font-normal opacity-60">(אופציונלי)</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="+972 50 123 4567"
            className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-sm text-cream placeholder-cream/30 outline-none transition focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
            dir="ltr"
          />
        </div>

        {/* Delivery method toggles */}
        <div className="flex gap-3">
          {[
            { key: 'viaEmail' as const, label: '📧 מייל' },
            { key: 'viaWhatsapp' as const, label: '💬 וואטסאפ' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setForm({ ...form, [key]: !form[key] })}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                form[key]
                  ? 'bg-gold text-navy'
                  : 'bg-white/10 text-cream/50 hover:bg-white/15'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-xl bg-gold py-3.5 text-sm font-bold text-navy transition hover:bg-gold-light disabled:opacity-60 active:scale-[0.99]"
        >
          {mutation.isPending ? 'שולח...' : 'הרשמה'}
        </button>

        {message && (
          <p className={`text-sm text-center ${message.includes('תודה') ? 'text-success' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </form>
    </section>
  )
}
