import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { submitSuggestion, type SuggestionInput } from '../lib/queries'

export function Suggest() {
  const [params] = useSearchParams()
  const prefillId = params.get('id')
  const prefillName = params.get('name') ?? ''
  const [type, setType] = useState<'new_tzaddik' | 'add_info'>(
    params.get('type') === 'new_tzaddik' || !prefillName ? (prefillName ? 'add_info' : 'new_tzaddik') : 'add_info'
  )
  const [form, setForm] = useState({
    tzaddikName: prefillName,
    hebrewDate: '',
    content: '',
    sources: '',
    submitterName: '',
    submitterEmail: '',
  })
  const [message, setMessage] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (s: SuggestionInput) => submitSuggestion(s),
    onSuccess: () => {
      setMessage('תודה רבה! ההצעה נשלחה ותיבדק על ידי העורך.')
      setForm({ tzaddikName: '', hebrewDate: '', content: '', sources: '', submitterName: '', submitterEmail: '' })
    },
    onError: () => setMessage('אירעה שגיאה בשליחה. נסו שוב מאוחר יותר.'),
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.content.trim()) { setMessage('נא למלא את תוכן ההצעה.'); return }
    if (type === 'new_tzaddik' && !form.tzaddikName.trim()) { setMessage('נא למלא את שם הצדיק.'); return }
    mutation.mutate({
      type,
      tzaddikId: prefillId ? Number(prefillId) : undefined,
      tzaddikName: form.tzaddikName || undefined,
      hebrewDate: form.hebrewDate || undefined,
      content: form.content,
      sources: form.sources || undefined,
      submitterName: form.submitterName || undefined,
      submitterEmail: form.submitterEmail || undefined,
    })
  }

  const field = 'w-full rounded-lg bg-surface-2 border border-rule px-4 py-3 text-sm text-ink placeholder:text-muted outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15'

  return (
    <div className="grid gap-6 pb-10">
      {/* Masthead */}
      <section className="text-center pt-1">
        <div className="dsy-dbl" />
        <div className="mt-5">
          <div className="text-[11px] tracking-[3px] font-bold text-gold mb-2">תְּרוּמָה לְזִכָּרוֹן</div>
          <h1 className="font-display font-black text-ink text-3xl sm:text-5xl text-balance">הַצִּיעוּ צַדִּיק אוֹ הוֹסִיפוּ מֵידָע</h1>
        </div>
        <div className="dsy-flourish my-4" aria-hidden="true">
          <span className="l" />
          <svg viewBox="0 0 68 20"><path d="M2 10H27M41 10H66" strokeWidth="1.1" /><path d="M34 3 L39.5 10 L34 17 L28.5 10 Z" /><circle cx="34" cy="10" r="2" fill="var(--ground)" /></svg>
          <span className="l" />
        </div>
        <p className="text-[13px] text-ink-soft max-w-md mx-auto">
          מכירים צדיק שאינו מופיע באתר, או מידע מדויק יותר על צדיק קיים? שתפו אותנו, וכל הצעה תיבדק מול מקורות לפני פרסום.
        </p>
      </section>

      <form onSubmit={submit} className="dsy-card relative overflow-hidden rounded-md bg-surface border border-rule shadow-[0_18px_40px_-30px_var(--shadow)] p-5 sm:p-8 max-w-2xl mx-auto w-full">
        <span className="dsy-cor tl" /><span className="dsy-cor tr" /><span className="dsy-cor bl" /><span className="dsy-cor br" />

        {/* Type toggle */}
        <div className="flex gap-2 mb-6">
          {([['new_tzaddik', 'צדיק חדש'], ['add_info', 'מידע או תיקון']] as const).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setType(val)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition border ${
                type === val ? 'bg-gold text-white border-gold' : 'bg-surface-2 text-ink-soft border-rule hover:border-gold/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gold-deep mb-1.5">
              שם הצדיק {type === 'new_tzaddik' && <span className="text-muted font-normal">(חובה)</span>}
            </label>
            <input
              value={form.tzaddikName}
              onChange={e => setForm({ ...form, tzaddikName: e.target.value })}
              placeholder="לדוגמה: רבי לוי יצחק מברדיטשוב"
              className={field}
              dir="rtl"
            />
          </div>

          {type === 'new_tzaddik' && (
            <div>
              <label className="block text-xs font-semibold text-gold-deep mb-1.5">תאריך פטירה עברי <span className="text-muted font-normal">(אם ידוע)</span></label>
              <input
                value={form.hebrewDate}
                onChange={e => setForm({ ...form, hebrewDate: e.target.value })}
                placeholder="לדוגמה: כ״ה בתשרי"
                className={field}
                dir="rtl"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gold-deep mb-1.5">
              {type === 'new_tzaddik' ? 'מי היה הצדיק, ומה תרם' : 'המידע או התיקון'} <span className="text-muted font-normal">(חובה)</span>
            </label>
            <textarea
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              rows={5}
              placeholder={type === 'new_tzaddik' ? 'ביוגרפיה קצרה, ספריו, סיפור או תורה מדבריו...' : 'מה יש לתקן או להוסיף, וכיצד...'}
              className={`${field} resize-y leading-7`}
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gold-deep mb-1.5">מקורות <span className="text-muted font-normal">(מומלץ)</span></label>
            <input
              value={form.sources}
              onChange={e => setForm({ ...form, sources: e.target.value })}
              placeholder="ספר, אתר, או מסורת שממנה המידע"
              className={field}
              dir="rtl"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <input
              value={form.submitterName}
              onChange={e => setForm({ ...form, submitterName: e.target.value })}
              placeholder="שמכם (לא חובה)"
              className={field}
              dir="rtl"
            />
            <input
              type="email"
              value={form.submitterEmail}
              onChange={e => setForm({ ...form, submitterEmail: e.target.value })}
              placeholder="אימייל למענה (לא חובה)"
              className={field}
              dir="rtl"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-full bg-ink text-ground px-8 py-3 text-sm font-bold transition hover:opacity-90 disabled:opacity-60 active:scale-[0.99]"
            >
              {mutation.isPending ? 'שולח...' : 'שליחת ההצעה'}
            </button>
            <Link to="/today" className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink transition">
              חזרה לגיליון <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {message && (
            <p className={`text-sm pt-1 ${message.includes('תודה') ? 'text-success' : 'text-red-500'}`}>
              {message}
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
