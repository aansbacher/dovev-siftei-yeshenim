// Continuous QA: mechanical, safe content fixes. Runs on a Vercel Cron (or manual ?secret=CRON_SECRET).
// Fixes: em-dashes, duplicate-bio junk, bio-fragment quotes, broken root-path images, date-in-name, empty-bio non-featured.
// Judgment issues (corrupted names, mismatched text, thin content) are only COUNTED here, for supervised review.
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: any, res: any) {
  const secret = req.query?.secret || (req.headers?.authorization || '').replace(/^Bearer\s+/i, '')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) { res.status(401).json({ error: 'unauthorized' }); return }

  try {
    const url = (process.env.VITE_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '')
    const sb = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY as string)
    const base = url + '/storage/v1/object/public/tzaddikim-images/'
    const SYMB = ['sample-books.png', 'beit-midrash.png', 'sefer-torah.png', 'kabbalah.png', 'jerusalem.png']

    let all: any[] = []
    for (let o = 0; o < 5000; o += 1000) { const { data } = await sb.from('tzaddikim').select('id,popular_name,importance_score,quote,biography,story,torah,image_url,hebrew_day,hebrew_month').range(o, o + 999); if (!data || !data.length) break; all = all.concat(data) }

    const fix: Record<string, number> = { emDash: 0, dupBio: 0, fragQuote: 0, image: 0, nameDate: 0, emptyHidden: 0 }
    const upd = (id: number, patch: any) => sb.from('tzaddikim').update(patch).eq('id', id)

    // 1. em-dashes
    for (const r of all) {
      const p: any = {}
      for (const f of ['biography', 'story', 'torah', 'quote']) if (r[f] && r[f].includes('—')) p[f] = r[f].replace(/\s*—\s*/g, ', ').replace(/([.,:;!?])\s*,\s*/g, '$1 ').replace(/,\s*,/g, ',').replace(/[,\s]+$/g, '').replace(/\s{2,}/g, ' ').trim()
      if (Object.keys(p).length) { await upd(r.id, p); fix.emDash++ }
    }

    // 2. duplicate-bio junk: keep highest score, suppress the rest (only if displayed)
    const bioMap: Record<string, any[]> = {}
    for (const r of all) { const b = (r.biography || '').trim(); if (b.length > 80) (bioMap[b] = bioMap[b] || []).push(r) }
    for (const b in bioMap) if (bioMap[b].length > 1) {
      const recs = bioMap[b].sort((a, b2) => b2.importance_score - a.importance_score)
      for (const r of recs.slice(1)) if (r.importance_score >= 30) { await upd(r.id, { importance_score: 20 }); fix.dupBio++ }
    }

    // 3. bio-fragment quotes (not real quotes)
    const clearQ = /למד מפי|נולד|כיהן|חיבר את|נכד|בן ר|תלמידו של|נסמך|ראש מתיבתא|\d{4}\s*-\s*[א-ת]|^.{0,4},\s*\d{4}/
    for (const r of all) if (r.importance_score >= 30 && r.quote && clearQ.test(r.quote)) { await upd(r.id, { quote: null }); fix.fragQuote++ }

    // 4. broken root-path symbolic images -> symbolic/ path
    for (const r of all) { const fn = (r.image_url || '').split('/').pop(); if (r.importance_score >= 30 && fn && SYMB.includes(fn) && !/symbolic\//.test(r.image_url)) { await upd(r.id, { image_url: base + 'symbolic/' + fn }); fix.image++ } }

    // 5. strip parenthetical date/year from popular_name
    for (const r of all) {
      const cleaned = (r.popular_name || '').replace(/\s*\((?:[^)]*(?:\d{3,4}|תק|תר|תש|ה')[^)]*)\)\s*$/, '').replace(/\s+[–-]\s*[^–-]*\d{3,4}\)?\s*$/, '').trim()
      if (cleaned && cleaned !== r.popular_name && cleaned.length > 3 && cleaned.length < 45) { await upd(r.id, { popular_name: cleaned }); fix.nameDate++ }
    }

    // 6. hide non-featured displayed records with empty bio
    for (const r of all) if (r.importance_score >= 30 && r.importance_score < 78 && (r.biography || '').trim().length < 50) { await upd(r.id, { importance_score: 22 }); fix.emptyHidden++ }

    // count remaining judgment issues (not fixed here)
    const firstName = (s: string) => { const m = (s || '').match(/(?:רבי|רב|הרב|חכם|האדמו"ר|הרה"ק)\s+([א-ת"'׳״]+(?:\s+[א-ת"'׳״]+){0,2})/); return m ? m[1] : '' }
    const w = (s: string) => (s || '').replace(/["'׳״]/g, '').split(/\s+/).filter(x => x.length > 2)
    const share = (a: string, b: string) => { const wb = new Set(w(b)); return w(a).some(x => wb.has(x)) }
    let mismatch = 0
    for (const r of all) if (r.importance_score >= 30) { const bn = firstName(r.biography); if (bn && r.popular_name && !share(bn, r.popular_name) && !share(r.popular_name, r.biography)) mismatch++ }

    // ── rolling-window report (next 7 Hebrew days) + daily email to owner ──
    const emptyDays: string[] = [], flags: string[] = []
    try {
      const { HDate } = await import('@hebcal/core')
      const MONTH: Record<string, string> = { Nisan: 'ניסן', Iyyar: 'אייר', Sivan: 'סיון', Tamuz: 'תמוז', Av: 'אב', Elul: 'אלול', Tishrei: 'תשרי', Cheshvan: 'חשוון', Kislev: 'כסלו', Tevet: 'טבת', "Sh'vat": 'שבט', Shvat: 'שבט', Adar: 'אדר', 'Adar I': 'אדר א', 'Adar II': 'אדר ב' }
      const L = (s: string) => (s || '').trim().length
      const today: any = new HDate(new Date())
      for (let k = 0; k < 7; k++) {
        const d: any = new HDate(today.abs() + k)
        const mHe = MONTH[d.getMonthName()] || d.getMonthName()
        const alias = mHe === 'חשוון' ? ['חשוון', 'חשון'] : [mHe]
        const figs = all.filter(r => r.hebrew_day === d.getDate() && alias.includes(r.hebrew_month) && r.importance_score >= 30).sort((a, b) => b.importance_score - a.importance_score).slice(0, 4)
        if (!figs.length) { emptyDays.push(`${d.getDate()} ${mHe}`); continue }
        for (const r of figs) {
          const iss: string[] = []
          if (L(r.story) < 300) iss.push('סיפור דק')
          if (L(r.torah) < 150) iss.push('תורה דקה')
          if (L(r.biography) < 60) iss.push('אין ביוגרפיה')
          if (/symbolic\//.test(r.image_url || '')) iss.push('תמונה סמלית')
          if (iss.length) flags.push(`${d.getDate()} ${mHe} · ${r.popular_name}: ${iss.join(', ')}`)
        }
      }
      const OWNER = process.env.REPORT_EMAIL || 'aansbacher@gmail.com'
      if (process.env.RESEND_API_KEY && process.env.RESEND_FROM) {
        const fixedLine = Object.entries(fix).filter(([, v]) => v > 0).map(([k, v]) => `${k}: ${v}`).join(' · ') || 'אין'
        const html = `<div style="font-family:Arial,sans-serif;direction:rtl;text-align:right;max-width:620px">
          <h2 style="color:#1E2A38;margin:0 0 10px">דוח QA יומי · קדושים בכל יום</h2>
          <p style="margin:6px 0"><b>תיקונים אוטומטיים בטוחים:</b> ${fixedLine}</p>
          <p style="margin:6px 0"><b>אי-התאמות טקסט לבדיקה:</b> ${mismatch}</p>
          ${emptyDays.length ? `<p style="margin:6px 0;color:#b45309"><b>⚠️ ימים ריקים (7 ימים קדימה):</b> ${emptyDays.join(' · ')}</p>` : ''}
          <p style="margin:14px 0 6px"><b>דורש תשומת לב אנושית — חלון 7 ימים (${flags.length}):</b></p>
          ${flags.length ? '<ul style="margin:0;padding-inline-start:18px;line-height:1.7">' + flags.map(f => `<li>${f}</li>`).join('') + '</ul>' : '<p style="color:#2f855a">הכול תקין בחלון 7 הימים ✓</p>'}
          <p style="color:#999;font-size:12px;margin-top:16px">סימון בלבד. התוכן העמוק נכתב בפיקוח, לא אוטומטית.</p>
        </div>`
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: process.env.RESEND_FROM, to: OWNER, subject: `דוח QA יומי · ${flags.length} לטיפול${emptyDays.length ? ', ' + emptyDays.length + ' ימים ריקים' : ''}`, html }),
          })
        } catch { /* email best-effort */ }
      }
    } catch { /* report best-effort — fixes already applied */ }

    res.status(200).json({ ok: true, fixed: fix, remainingJudgment: { textMismatch: mismatch }, window: { emptyDays, flags } })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
}
