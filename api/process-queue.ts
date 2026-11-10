import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

// Opus 5.5 for quality (vision + verification + storyteller writing).
// Switch to 'claude-sonnet-5-5' if you need faster/cheaper runs.
const MODEL = 'claude-opus-5-5'
const CREDIT = 'תורת החסידות (דוד אלפסי)'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const sb = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// allow long model runs (vision + thinking). Needs a Vercel plan that permits it.
export const config = { maxDuration: 300 }

const SYSTEM = `אתה עורך תוכן לאתר הנצחה "קדושים בכל יום" המציג צדיקים שנפטרו בתאריך העברי של היום. אתה מקבל הגשה: שם צדיק, תאריך פטירה, הערה, טקסט שהודבק, וצילומים של עמודי ספר (מקור מאומת). משימתך: להפיק ערך מלא ומדויק בעברית.

כללי ברזל (חובה מוחלטת):
- אסור בתכלית להמציא עובדות, סיפורים, תאריכים או ציטוטים. עדיף להשאיר שדה ריק (null) מאשר להמציא. "עדיף לדלג מאשר לבזות".
- אמת את יום ההילולא (יום + חודש עברי) מול הצילומים ו/או חיפוש אינטרנט. אם אינך בטוח בתאריך — סמן date_verified=false.
- אם המקורות דלים ואין סיפור אמיתי — החזר story=null. אל תמתח ואל תנפח.
- ציטוט (quote) רק אם הוא מילולי ומאומת; אחרת null.
- כתיבה בגוף שלישי, עברית, בלי מקפים (אין "—"), בסגנון מספר סיפורים חי וקונקרטי — לא תקציר ויקיפדיה יבש. ביוגרפיה ~2 פסקאות.
- importance_score בין 30 ל-95 לפי חשיבות הצדיק.

החזר אך ורק אובייקט JSON יחיד (בלי טקסט לפניו או אחריו, בלי code fences), במבנה:
{
 "ok": true/false,            // האם יש מספיק מידע מאומת כדי לכתוב ערך
 "needs_review": true/false,  // true אם יש ספק כלשהו שמצריך עין אנושית
 "date_verified": true/false, // האם יום+חודש הפטירה אומתו
 "hebrew_day": number|null,
 "hebrew_month": string|null, // למשל "כסלו"
 "popular_name": string,
 "full_name": string|null,
 "years": string|null,
 "role": string|null,
 "biography": string,
 "story": string|null,
 "torah": string|null,
 "quote": string|null,
 "importance_score": number,
 "notes": string             // מה אומת, מה לא, ומקורות
}`

function parseContent(content: string) {
  const note = (content.match(/הערה:\s*([^\n]+)/) || [])[1] || ''
  const imgs = content.match(/https?:\/\/\S+\.(?:jpg|jpeg|png|webp)/gi) || []
  const text = content.replace(/תמונות:[\s\S]*$/, '').replace(/הערה:\s*[^\n]+\n?/, '').trim()
  return { note, imgs, text }
}

async function imageBlock(url: string) {
  const r = await fetch(url)
  if (!r.ok) return null
  const buf = Buffer.from(await r.arrayBuffer())
  const media = url.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
  return { type: 'image', source: { type: 'base64', media_type: media, data: buf.toString('base64') } }
}

function extractJson(s: string): any {
  const a = s.indexOf('{'), b = s.lastIndexOf('}')
  if (a < 0 || b < 0) throw new Error('no JSON in model output')
  return JSON.parse(s.slice(a, b + 1))
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST' && req.method !== 'GET') { res.status(405).end(); return }

  // auth: Vercel cron (Bearer CRON_SECRET) OR admin button (password)
  const cronOk = process.env.CRON_SECRET && req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`
  const pwOk = (req.body?.password ?? '').trim() && req.body.password.trim() === (process.env.ADMIN_PASSWORD ?? '').trim()
  if (!cronOk && !pwOk) { res.status(401).json({ error: 'unauthorized' }); return }
  if (!process.env.ANTHROPIC_API_KEY) { res.status(400).json({ error: 'ANTHROPIC_API_KEY not set' }); return }

  // oldest pending suggestion
  const { data: pend } = await sb.from('suggestions').select('*').eq('status', 'pending').order('created_at', { ascending: true }).limit(1)
  const sug = pend?.[0]
  if (!sug) { res.json({ ok: true, processed: 0, message: 'אין פריטים ממתינים' }); return }

  // mark processing (so a second cron tick doesn't grab it)
  await sb.from('suggestions').update({ status: 'processing' }).eq('id', sug.id)

  try {
    const { note, imgs, text } = parseContent(sug.content || '')
    const blocks: any[] = []
    for (const u of imgs.slice(0, 6)) { const b = await imageBlock(u); if (b) blocks.push(b) }
    const kind = sug.type === 'new_tzaddik' ? 'צדיק חדש (ליצור ערך חדש)' : 'עיבוי/שכתוב ערך קיים'
    blocks.push({ type: 'text', text:
`סוג: ${kind}
שם הצדיק: ${sug.tzaddik_name || ''}
תאריך פטירה (אם צוין): ${sug.hebrew_date || '—'}
הערת המזין: ${note || '—'}
טקסט שהודבק: ${text || '—'}

קרא היטב את הצילומים המצורפים, אמת את התאריך, וכתוב ערך מלא לפי הכללים. החזר JSON בלבד.` })

    const msg: any = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM,
      messages: [{ role: 'user', content: blocks }],
      tools: [{ type: 'web_search_20260209' as any, name: 'web_search' }],
    } as any)

    const out = (msg.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n')
    const j = extractJson(out)

    // GUARDRAIL: anything uncertain -> hold for review, never publish unverified
    const confident = j.ok && !j.needs_review && j.date_verified && j.popular_name && j.biography &&
      (sug.type !== 'new_tzaddik' || (j.hebrew_day && j.hebrew_month))

    if (!confident) {
      await sb.from('suggestions').update({
        status: 'needs_review',
        content: (sug.content || '') + `\n\n--- טיוטה אוטומטית (דורשת בדיקה) ---\n${JSON.stringify(j, null, 1)}`,
      }).eq('id', sug.id)
      res.json({ ok: true, processed: 1, action: 'held_for_review', id: sug.id, name: j.popular_name, notes: j.notes })
      return
    }

    const fields: Record<string, any> = {
      popular_name: j.popular_name, full_name: j.full_name || null, years: j.years || null,
      role: j.role || null, biography: j.biography || null, story: j.story || null,
      torah: j.torah || null, quote: j.quote || null,
      importance_score: j.importance_score || 60,
      sources: imgs.length ? CREDIT : (j.notes ? 'ויקיפדיה' : null),
    }

    let targetId = sug.tzaddik_id
    if (sug.type === 'new_tzaddik') {
      const { data: top } = await sb.from('tzaddikim').select('id').order('id', { ascending: false }).limit(1)
      targetId = ((top?.[0]?.id ?? 900000) + 1)
      await sb.from('tzaddikim').insert({
        id: targetId, hebrew_day: j.hebrew_day, hebrew_month: j.hebrew_month,
        image_url: 'https://xcdnophqazxcpeavmthu.supabase.co/storage/v1/object/public/tzaddikim-images/symbolic/sample-books.png',
        ...fields,
      })
    } else {
      await sb.from('tzaddikim').update(fields).eq('id', targetId)
    }

    await sb.from('suggestions').update({ status: 'done' }).eq('id', sug.id)
    res.json({ ok: true, processed: 1, action: sug.type === 'new_tzaddik' ? 'created' : 'updated', id: sug.id, tzaddik_id: targetId, name: j.popular_name })
  } catch (err: any) {
    // on any failure, leave it reviewable (not stuck in 'processing')
    await sb.from('suggestions').update({ status: 'needs_review' }).eq('id', sug.id)
    console.error('process-queue:', err?.message)
    res.status(500).json({ error: `שגיאה: ${err?.message}`, id: sug.id })
  }
}
