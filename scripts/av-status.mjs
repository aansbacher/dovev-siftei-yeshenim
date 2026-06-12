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

const { data } = await supabase
  .from('tzaddikim')
  .select('id, hebrew_day, popular_name, full_name, biography, story, torah, quote')
  .eq('hebrew_month', 'אב')
  .order('hebrew_day')
  .order('id')

const byDay = {}
for (const r of data) {
  if (!byDay[r.hebrew_day]) byDay[r.hebrew_day] = []
  byDay[r.hebrew_day].push(r)
}

console.log('\n=== אב — מצב נוכחי ===\n')

let total = 0
const emptyDays = []
const fullDays = []

for (let d = 1; d <= 30; d++) {
  const recs = byDay[d] || []
  if (recs.length === 0) {
    emptyDays.push(d)
    continue
  }
  fullDays.push(d)
  console.log(`יום ${d}:`)
  for (const r of recs) {
    const complete = r.biography && r.story && r.torah && r.quote
    const mark = complete ? '✓' : '✗'
    const name = r.popular_name || r.full_name || '(ללא שם)'
    console.log(`  ${mark} id=${r.id} — ${name}`)
  }
  total += recs.length
}

console.log(`\nסה"כ: ${total} רשומות ב-${fullDays.length} ימים`)
console.log(`ימים עם רשומות: ${fullDays.join(', ')}`)
console.log(`ימים ריקים (${emptyDays.length}): ${emptyDays.join(', ')}`)
