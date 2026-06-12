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

for (const month of ['סיון', 'תמוז']) {
  const { data } = await sb.from('tzaddikim')
    .select('id, hebrew_day, popular_name')
    .eq('hebrew_month', month)
    .is('image_url', null)
    .order('hebrew_day').order('id')

  console.log(`\n=== ${month} — ללא תמונה (${data.length}) ===`)
  for (const r of data) {
    console.log(`  id=${r.id} יום ${r.hebrew_day}: ${r.popular_name}`)
  }
}
