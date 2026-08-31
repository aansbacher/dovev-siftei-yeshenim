// Daily digest sender (Resend). Triggered by Vercel Cron or a manual call with ?secret=CRON_SECRET.
// Required env: SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_URL, RESEND_API_KEY, RESEND_FROM, CRON_SECRET
import { createClient } from '@supabase/supabase-js'
import { HDate } from '@hebcal/core'

const HEB_MONTHS: Record<number, string> = {
  1: 'ניסן', 2: 'אייר', 3: 'סיון', 4: 'תמוז', 5: 'אב', 6: 'אלול',
  7: 'תשרי', 8: 'חשוון', 9: 'כסלו', 10: 'טבת', 11: 'שבט', 12: 'אדר', 13: 'אדר',
}

function esc(s: string) {
  return String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))
}

function emailHtml(t: any, hebDateDisplay: string) {
  const quote = t.quote ? `<p style="font-family:Georgia,serif;font-size:19px;line-height:1.7;color:#1B2530;margin:0 0 14px;">״${esc(t.quote)}״</p>` : ''
  const bio = t.biography ? `<p style="font-size:15px;line-height:1.8;color:#4C5560;margin:0 0 18px;">${esc(t.biography)}</p>` : ''
  const img = t.image_url && /wiki\//.test(t.image_url)
    ? `<img src="${esc(t.image_url)}" alt="${esc(t.popular_name)}" width="96" style="border:1px solid #9C7734;border-radius:3px;display:block;margin:0 auto 16px;">`
    : ''
  return `<!doctype html><html dir="rtl" lang="he"><body style="margin:0;background:#EFE7D6;padding:24px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FBF8F1;border:1px solid #D9CDB4;border-radius:6px;">
      <tr><td style="padding:26px 30px;text-align:center;">
        <div style="border-top:2px solid #9C7734;margin-bottom:16px;"></div>
        <div style="font-size:11px;letter-spacing:3px;color:#9C7734;font-weight:bold;">בַּעַל הַהִילּוּלָא שֶׁל הַיּוֹם</div>
        <div style="font-family:Georgia,serif;font-size:30px;font-weight:bold;color:#1B2530;margin:8px 0 20px;">${esc(hebDateDisplay)}</div>
        ${img}
        <h1 style="font-family:Georgia,serif;font-size:24px;color:#1B2530;margin:0 0 14px;">${esc(t.popular_name)}</h1>
        ${quote}
        ${bio}
        <a href="https://dovev-siftei-yeshenim.vercel.app/today" style="display:inline-block;background:#1B2530;color:#EFE7D6;text-decoration:none;font-weight:bold;font-size:14px;padding:11px 26px;border-radius:999px;margin-top:6px;">לגיליון המלא</a>
        <div style="border-top:2px solid #9C7734;margin-top:24px;"></div>
        <div style="font-size:12px;color:#918972;margin-top:12px;">דובב שפתי ישנים · זכר צדיקים לברכה</div>
      </td></tr>
    </table>
  </td></tr></table></body></html>`
}

export default async function handler(req: any, res: any) {
  const secret = req.query?.secret || (req.headers?.authorization || '').replace(/^Bearer\s+/i, '')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    res.status(401).json({ error: 'unauthorized' }); return
  }
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
    res.status(500).json({ error: 'Resend not configured (RESEND_API_KEY / RESEND_FROM)' }); return
  }

  try {
    const url = (process.env.VITE_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '')
    const sb = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY as string)

    // today's Hebrew date -> lead tzaddik
    const hd = new HDate(new Date())
    const day = hd.getDate()
    const month = HEB_MONTHS[hd.getMonth()] || ''
    const monthFilter = month === 'חשוון' ? ['חשוון', 'חשון'] : [month]
    let q = sb.from('tzaddikim').select('*').eq('hebrew_day', day).gte('importance_score', 30)
    q = monthFilter.length === 1 ? q.eq('hebrew_month', monthFilter[0]) : q.or(monthFilter.map(m => `hebrew_month.eq.${m}`).join(','))
    const { data: tzList } = await q.order('importance_score', { ascending: false }).limit(1)
    const t = tzList?.[0]
    if (!t) { res.status(200).json({ sent: 0, note: 'no tzaddik for today' }); return }

    // subscribers who opted into email
    const { data: subs } = await sb.from('subscribers').select('email').eq('via_email', true)
    const recipients = (subs || []).map((s: any) => s.email).filter(Boolean)
    if (!recipients.length) { res.status(200).json({ sent: 0, note: 'no subscribers' }); return }

    const html = emailHtml(t, `${gematriya(day)} ${month}`)
    const subject = `${t.popular_name} · ${gematriya(day)} ${month}`

    // Resend batch (max 100 per call)
    let sent = 0
    for (let i = 0; i < recipients.length; i += 100) {
      const batch = recipients.slice(i, i + 100).map((to: string) => ({
        from: process.env.RESEND_FROM, to, subject, html,
      }))
      const r = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      })
      if (r.ok) sent += batch.length
      else console.error('Resend error', await r.text())
    }
    res.status(200).json({ sent, tzaddik: t.popular_name, date: `${gematriya(day)} ${month}` })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
}

// minimal Hebrew day gematria (1..30) with gershayim
function gematriya(n: number): string {
  const g = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'יא', 'יב', 'יג', 'יד', 'טו', 'טז', 'יז', 'יח', 'יט', 'כ', 'כא', 'כב', 'כג', 'כד', 'כה', 'כו', 'כז', 'כח', 'כט', 'ל']
  const s = g[n] || String(n)
  return s.length === 1 ? `${s}׳` : `${s.slice(0, -1)}״${s.slice(-1)}`
}
