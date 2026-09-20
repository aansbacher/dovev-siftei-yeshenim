// One-click unsubscribe for the daily digest. Linked from every email/WhatsApp message.
// GET /api/unsubscribe?email=<addr>[&scope=email|whatsapp|all]
//  or  /api/unsubscribe?phone=<num>[&scope=...]
// Required env: SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_URL
import { createClient } from '@supabase/supabase-js'

function page(title: string, body: string) {
  return `<!doctype html><html dir="rtl" lang="he"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title></head>
  <body style="margin:0;background:#EAEDF9;font-family:system-ui,Arial,sans-serif;">
    <div style="max-width:460px;margin:64px auto;background:#fff;border:1px solid #E6E9F6;border-radius:20px;padding:32px 28px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">🕯️</div>
      <h1 style="font-size:20px;color:#2A3350;margin:0 0 10px;">${title}</h1>
      <p style="font-size:15px;line-height:1.7;color:#5B6480;margin:0 0 20px;">${body}</p>
      <a href="https://dovev-siftei-yeshenim.vercel.app/" style="display:inline-block;background:#5B76E5;color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:10px 24px;border-radius:999px;">חזרה לאתר</a>
      <div style="font-size:12px;color:#98A0B8;margin-top:22px;">דובב שפתי ישנים · זכר צדיקים לברכה</div>
    </div>
  </body></html>`
}

export default async function handler(req: any, res: any) {
  const { email, phone, scope = 'all' } = req.query ?? {}
  res.setHeader('Content-Type', 'text/html; charset=utf-8')

  if (!email && !phone) {
    res.status(400).send(page('קישור לא תקין', 'לא צוינה כתובת להסרה.')); return
  }
  try {
    const url = (process.env.VITE_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '')
    const sb = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY as string)

    // find the subscriber
    let sel = sb.from('subscribers').select('*').limit(1)
    sel = email ? sel.eq('email', email) : sel.eq('phone', phone)
    const { data: rows } = await sel
    const sub = rows?.[0]
    if (!sub) { res.status(200).send(page('לא נמצא מנוי', 'הכתובת אינה רשומה לדיוור — ייתכן שכבר הוסרת.')); return }

    // apply the requested opt-out
    const patch: Record<string, boolean> = {}
    if (scope === 'email' || scope === 'all') patch.via_email = false
    if (scope === 'whatsapp' || scope === 'all') patch.via_whatsapp = false

    const stillOn = (scope === 'whatsapp' && sub.via_email) || (scope === 'email' && sub.via_whatsapp)
    if (stillOn) {
      await sb.from('subscribers').update(patch).eq('id', sub.id)
    } else {
      // no channels left — remove the record entirely
      await sb.from('subscribers').delete().eq('id', sub.id)
    }

    const what = scope === 'email' ? 'מהדיוור במייל' : scope === 'whatsapp' ? 'מהדיוור בוואטסאפ' : 'מהדיוור היומי'
    res.status(200).send(page('הוסרת בהצלחה', `הוסרת ${what}. לא יישלחו אליך עוד הודעות. תודה שהיית איתנו — תמיד אפשר להירשם מחדש.`))
  } catch (e: any) {
    res.status(500).send(page('שגיאה', 'אירעה תקלה בהסרה. נסו שוב מאוחר יותר.'))
  }
}
