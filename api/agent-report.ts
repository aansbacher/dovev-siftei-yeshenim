// Emails the daily enrichment agent's run summary to the site owner (via Resend).
// POST { token, subject, body } — token must equal WRITER_TOKEN or CRON_SECRET.
// Required env: RESEND_API_KEY, RESEND_FROM. Optional: REPORT_EMAIL (defaults to owner).
const OWNER = process.env.REPORT_EMAIL || 'aansbacher@gmail.com'

function esc(s: string) {
  return String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string))
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end()
  const { token, subject, body } = req.body ?? {}
  const ok = token && (token === process.env.WRITER_TOKEN || token === process.env.CRON_SECRET)
  if (!ok) return res.status(401).json({ error: 'unauthorized' })
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
    return res.status(500).json({ error: 'resend_not_configured' })
  }
  const html = `<div dir="rtl" style="font-family:system-ui,Arial,sans-serif;font-size:15px;line-height:1.75;color:#2A3350;white-space:pre-wrap;background:#EAEDF9;padding:20px;border-radius:14px;">${esc(body).replace(/\n/g, '<br>')}</div>`
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.RESEND_FROM, to: OWNER, subject: subject || 'דובב — דוח סוכן יומי', html }),
  })
  if (!r.ok) return res.status(500).json({ error: await r.text() })
  res.json({ ok: true })
}
