// Daily WhatsApp digest via the WhatsApp Cloud API (Meta official).
// Triggered by Vercel Cron (Authorization: Bearer CRON_SECRET) or ?secret=CRON_SECRET.
//
// Required env:
//   SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_URL
//   CRON_SECRET
//   WHATSAPP_TOKEN        – permanent access token of the Meta app/system-user
//   WHATSAPP_PHONE_ID     – the phone-number id of your WhatsApp Business number
//   WHATSAPP_TEMPLATE     – name of an APPROVED template (default: daily_hilula)
//   WHATSAPP_LANG         – template language code (default: he)
//
// The template must have a BODY with three variables, e.g.:
//   בעל ההילולה של היום: {{1}} · {{2}}
//   לגיליון המלא: dovev-siftei-yeshenim.vercel.app/today
//   להסרה מהדיוור: {{3}}
// ({{1}} = name, {{2}} = Hebrew date, {{3}} = personal unsubscribe link)
import { createClient } from '@supabase/supabase-js'
import { HDate } from '@hebcal/core'

const HEB_MONTHS: Record<number, string> = {
  1: 'ניסן', 2: 'אייר', 3: 'סיון', 4: 'תמוז', 5: 'אב', 6: 'אלול',
  7: 'תשרי', 8: 'חשוון', 9: 'כסלו', 10: 'טבת', 11: 'שבט', 12: 'אדר', 13: 'אדר',
}

function gematriya(n: number): string {
  const g = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'יא', 'יב', 'יג', 'יד', 'טו', 'טז', 'יז', 'יח', 'יט', 'כ', 'כא', 'כב', 'כג', 'כד', 'כה', 'כו', 'כז', 'כח', 'כט', 'ל']
  const s = g[n] || String(n)
  return s.length === 1 ? `${s}׳` : `${s.slice(0, -1)}״${s.slice(-1)}`
}

// Israeli/local phone -> E.164 digits (no '+') for the Cloud API "to" field.
function normalizePhone(raw: string): string | null {
  let d = String(raw ?? '').replace(/[^\d]/g, '')
  if (!d) return null
  if (d.startsWith('00')) d = d.slice(2)
  if (d.startsWith('0')) d = '972' + d.slice(1) // local IL number
  return d.length >= 8 ? d : null
}

export default async function handler(req: any, res: any) {
  const secret = req.query?.secret || (req.headers?.authorization || '').replace(/^Bearer\s+/i, '')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    res.status(401).json({ error: 'unauthorized' }); return
  }
  const TOKEN = process.env.WHATSAPP_TOKEN
  const PHONE_ID = process.env.WHATSAPP_PHONE_ID
  const TEMPLATE = process.env.WHATSAPP_TEMPLATE || 'daily_hilula'
  const LANG = process.env.WHATSAPP_LANG || 'he'
  if (!TOKEN || !PHONE_ID) {
    res.status(500).json({ error: 'WhatsApp not configured (WHATSAPP_TOKEN / WHATSAPP_PHONE_ID)' }); return
  }

  try {
    const url = (process.env.VITE_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '')
    const sb = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY as string)

    const hd = new HDate(new Date())
    const day = hd.getDate()
    const month = HEB_MONTHS[hd.getMonth()] || ''
    const monthFilter = month === 'חשוון' ? ['חשוון', 'חשון'] : [month]
    let q = sb.from('tzaddikim').select('popular_name').eq('hebrew_day', day).gte('importance_score', 30)
    q = monthFilter.length === 1 ? q.eq('hebrew_month', monthFilter[0]) : q.or(monthFilter.map(m => `hebrew_month.eq.${m}`).join(','))
    const { data: tzList } = await q.order('importance_score', { ascending: false }).limit(1)
    const t = tzList?.[0]
    if (!t) { res.status(200).json({ sent: 0, note: 'no tzaddik for today' }); return }

    const { data: subs } = await sb.from('subscribers').select('phone').eq('via_whatsapp', true)
    const phones = (subs || []).map((s: any) => s.phone).filter(Boolean)
    if (!phones.length) { res.status(200).json({ sent: 0, note: 'no whatsapp subscribers' }); return }

    const dateLabel = `${gematriya(day)} ${month}`
    const endpoint = `https://graph.facebook.com/v20.0/${PHONE_ID}/messages`
    let sent = 0, failed = 0

    for (const raw of phones) {
      const to = normalizePhone(raw)
      if (!to) { failed++; continue }
      const unsub = `dovev-siftei-yeshenim.vercel.app/api/unsubscribe?scope=whatsapp&phone=${encodeURIComponent(raw)}`
      const body = {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: TEMPLATE,
          language: { code: LANG },
          components: [{
            type: 'body',
            parameters: [
              { type: 'text', text: t.popular_name },
              { type: 'text', text: dateLabel },
              { type: 'text', text: unsub },
            ],
          }],
        },
      }
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (r.ok) sent++
      else { failed++; console.error('WA send error', to, await r.text()) }
    }
    res.status(200).json({ sent, failed, tzaddik: t.popular_name, date: dateLabel })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
}
