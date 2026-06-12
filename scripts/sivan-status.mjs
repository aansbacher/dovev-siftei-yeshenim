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
  .select('id,hebrew_day,popular_name,full_name,biography,story,torah,quote')
  .eq('hebrew_month', 'סיון')
  .order('hebrew_day')
  .limit(300)

const byDay = {}
data.forEach(r => {
  if (!byDay[r.hebrew_day]) byDay[r.hebrew_day] = []
  byDay[r.hebrew_day].push(r)
})

const allDays = Object.keys(byDay).map(Number).sort((a, b) => a - b)
const allSivanDays = Array.from({length: 30}, (_, i) => i + 1)
const missingDays = allSivanDays.filter(d => !allDays.includes(d))

console.log('=== סיוון — מצב נוכחי ===\n')
allDays.forEach(d => {
  console.log(`יום ${d}:`)
  byDay[d].forEach(r => {
    const name = (r.popular_name || r.full_name || '').slice(0, 40)
    const hasAll = r.biography && r.story && r.torah && r.quote
    console.log(`  ${hasAll ? '✓' : '✗'} id=${r.id} — ${name}`)
  })
})

console.log(`\nסה"כ: ${data.length} רשומות ב-${allDays.length} ימים`)
console.log(`ימים עם רשומות: ${allDays.join(', ')}`)
console.log(`ימים ריקים (${missingDays.length}): ${missingDays.join(', ')}`)
