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

const months = ['תשרי','חשוון','כסלו','טבת','שבט','אדר','ניסן','אייר','סיון','תמוז','אב','אלול']

console.log('\n📊 דוח חודשי — מצב תוכן\n')
console.log('חודש'.padEnd(8), 'סה"כ'.padEnd(7), 'שלמות'.padEnd(8), '%'.padEnd(6), 'חסרות')
console.log('─'.repeat(50))

const results = []
for (const month of months) {
  const { data } = await supabase
    .from('tzaddikim')
    .select('id,biography,story,torah,quote')
    .eq('hebrew_month', month)
    .limit(500)

  if (!data || data.length === 0) continue
  const complete = data.filter(r => r.biography && r.story && r.torah && r.quote).length
  const pct = Math.round(complete / data.length * 100)
  const missing = data.length - complete
  results.push({ month, total: data.length, complete, pct, missing })
  const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5))
  console.log(
    month.padEnd(8),
    String(data.length).padEnd(7),
    String(complete).padEnd(8),
    `${pct}%`.padEnd(6),
    missing > 0 ? `חסרות: ${missing}` : '✓ הושלם'
  )
}

const notDone = results.filter(r => r.missing > 0).sort((a, b) => b.missing - a.missing)
console.log('\n🎯 המלצה — חודשים לפי מספר חסרות (יותר חסרות = עדיפות גבוהה יותר):')
notDone.forEach((r, i) => console.log(`  ${i + 1}. ${r.month} — ${r.missing} חסרות (${r.pct}% שלם)`))
