import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

function parseEnv(f) {
  return fs.readFileSync(f, 'utf8').split(/\r?\n/).reduce((e, l) => {
    const c = l.trim()
    if (!c || c.startsWith('#')) return e
    const [k, ...r] = c.split('=')
    e[k.trim()] = r.join('=').trim()
    return e
  }, {})
}
const env = parseEnv(path.resolve('.env.local'))
const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

// Sample 5 records from Sivan and Tamuz with full story/sources
for (const month of ['סיון', 'תמוז']) {
  const { data } = await sb.from('tzaddikim')
    .select('id, hebrew_day, popular_name, sources, story')
    .eq('hebrew_month', month)
    .not('story', 'is', null)
    .limit(5)
    .order('id')

  console.log(`\n========= ${month} — דגימה =========`)
  for (const r of data) {
    const src = Array.isArray(r.sources) ? r.sources.join(' | ') : r.sources
    console.log(`\nיום ${r.hebrew_day}: ${r.popular_name}`)
    console.log(`מקורות: ${src}`)
    console.log(`סיפור: ${(r.story||'').slice(0, 200)}...`)
  }
}
