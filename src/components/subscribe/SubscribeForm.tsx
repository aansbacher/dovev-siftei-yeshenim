import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { subscribeUser } from '../../lib/queries'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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
    <section id="subscribe" className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mb-6 text-right">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">דיוור יומי</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">הירשם לקבלת השראה ישירות למייל או וואטסאפ</h2>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="grid gap-4">
          <Input
            label="אימייל"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="הכנס כתובת אימייל"
            required
          />
          <Input
            label="טלפון ווטסאפ (אופציונלי)"
            type="tel"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            placeholder="+972 50 123 4567"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Checkbox
              label="אני רוצה לקבל במייל"
              checked={form.viaEmail}
              onChange={(checked) => setForm({ ...form, viaEmail: checked })}
            />
            <Checkbox
              label="אני רוצה לקבל בוואטסאפ"
              checked={form.viaWhatsapp}
              onChange={(checked) => setForm({ ...form, viaWhatsapp: checked })}
            />
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-4 sm:items-end">
          <Button type="submit" className="w-full sm:w-auto">
            הרשמה
          </Button>
          {message ? <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p> : null}
        </div>
      </form>
    </section>
  )
}
