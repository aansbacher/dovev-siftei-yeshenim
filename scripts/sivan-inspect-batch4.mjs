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
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const ids = [11107, 11902, 11118, 11134, 11088, 11059]

const { data } = await supabase
  .from('tzaddikim')
  .select('id,hebrew_day,hebrew_month,popular_name,full_name,biography,story,torah,quote,sources')
  .in('id', ids)
  .order('id')

for (const r of data) {
  console.log(`\n=== id=${r.id} | יום ${r.hebrew_day} ${r.hebrew_month} ===`)
  console.log(`שם: ${r.popular_name || r.full_name}`)
  console.log(`ביוגרפיה: ${(r.biography || '').slice(0, 200)}`)
  console.log(`סיפור: ${r.story ? r.story.slice(0, 100) : '—'}`)
  console.log(`תורה: ${r.torah ? r.torah.slice(0, 100) : '—'}`)
  console.log(`ציטוט: ${r.quote ? r.quote.slice(0, 80) : '—'}`)
  console.log(`מקורות: ${r.sources || '—'}`)
}
