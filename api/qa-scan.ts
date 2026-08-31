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
    for (let o = 0; o < 5000; o += 1000) { const { data } = await sb.from('tzaddikim').select('id,popular_name,importance_score,quote,biography,story,torah,image_url').range(o, o + 999); if (!data || !data.length) break; all = all.concat(data) }

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

    res.status(200).json({ ok: true, fixed: fix, remainingJudgment: { textMismatch: mismatch } })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
}
