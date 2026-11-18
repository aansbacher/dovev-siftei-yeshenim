import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { subscribeUser } from '../../lib/queries'
import type { Subscriber } from '../../types'
import { useI18n } from '../../lib/i18n'

const WHATSAPP_GROUP = 'https://chat.whatsapp.com/IRsYx8g1hc1EdOycqR3EJc'

export function SubscribeForm() {
  const { t, dir } = useI18n()
  const [form, setForm] = useState({
    email: '',
    phone: '',
    viaEmail: true,
    viaWhatsapp: false,
  })
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  const mutation = useMutation({
    mutationFn: async (subscriber: Subscriber) => subscribeUser(subscriber),
    onSuccess: () => {
      setMessage({ text: t.sub_thanks, ok: true })
      setForm({ email: '', phone: '', viaEmail: true, viaWhatsapp: false })
    },
    onError: () => {
      setMessage({ text: t.sub_error, ok: false })
    },
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.viaEmail && !form.viaWhatsapp) {
      setMessage({ text: t.sub_pickOne, ok: false })
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

      <div className="relative z-[1] max-w-lg mx-auto" dir={dir}>
        <div className="text-[11px] tracking-[3px] font-bold text-gold mb-2">{t.sub_eyebrow}</div>
        <h2 className="font-display font-bold text-ink text-2xl sm:text-[25px] mb-1.5">
          {t.sub_title}
        </h2>
        <p className="text-[13px] text-muted mb-5">
          {t.sub_body}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder={t.sub_email}
              className="flex-1 rounded-lg bg-surface-2 border border-rule px-4 py-3 text-sm text-ink placeholder:text-muted outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
              dir={dir}
            />
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder={t.sub_phone}
              className="flex-1 rounded-lg bg-surface-2 border border-rule px-4 py-3 text-sm text-ink placeholder:text-muted outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
              dir={dir}
            />
          </div>

          <div className="flex items-center justify-center gap-2">
            {[
              { key: 'viaEmail' as const, label: t.sub_emailBtn },
              { key: 'viaWhatsapp' as const, label: t.sub_waBtn },
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
              {mutation.isPending ? t.sub_sending : t.sub_submit}
            </button>
          </div>

          {message && (
            <p className={`text-sm ${message.ok ? 'text-success' : 'text-red-500'}`}>
              {message.text}
            </p>
          )}
        </form>

        {/* WhatsApp community group */}
        <div className="mt-6 pt-5 border-t border-rule">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px flex-1 max-w-[60px] bg-[color:var(--line)]" />
            <span className="text-[11px] font-bold tracking-[2px] text-muted">{t.sub_or}</span>
            <span className="h-px flex-1 max-w-[60px] bg-[color:var(--line)]" />
          </div>
          <p className="text-[13px] text-muted mb-3.5">{t.sub_waPrefer}</p>
          <a
            href={WHATSAPP_GROUP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#25D366] text-white px-7 py-2.5 text-sm font-bold shadow-sm hover:brightness-95 transition"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.7.2l-.9 1.1c-.2.2-.3.2-.6.1a8 8 0 01-2.4-1.5 9 9 0 01-1.6-2c-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5s0-.4 0-.5l-1-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.1 4.6 2.6 1 2.9.7 3.4.7.5 0 1.7-.7 1.9-1.4.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 00-8.6 15l-1.1 4.1 4.2-1.1A10 10 0 1012 2z"/></svg>
            {t.sub_waJoin}
          </a>
        </div>
      </div>
    </section>
  )
}
