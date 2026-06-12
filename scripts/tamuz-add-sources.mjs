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

// שליפת כל רשומות תמוז חסרות מקור
const { data, error } = await supabase
  .from('tzaddikim')
  .select('id, popular_name, hebrew_day')
  .eq('hebrew_month', 'תמוז')
  .is('sources', null)
  .order('hebrew_day')

if (error) { console.error('שגיאה בשליפה:', error.message); process.exit(1) }

console.log(`נמצאו ${data.length} רשומות ללא מקור — מוסיף 'קדושים בכל יום (Facebook)'...\n`)

let passed = 0, failed = 0

for (const r of data) {
  const { error: e } = await supabase
    .from('tzaddikim')
    .update({ sources: ['קדושים בכל יום (Facebook)'] })
    .eq('id', r.id)
  if (e) { console.error(`✗ ${r.id} ${r.popular_name}: ${e.message}`); failed++ }
  else { process.stdout.write(`✓${r.id} `); passed++ }
}

console.log(`\n\nעברו: ${passed} | נכשלו: ${failed}`)
