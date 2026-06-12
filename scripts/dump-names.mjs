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

for (const month of ['סיון', 'תמוז']) {
  const { data } = await supabase
    .from('tzaddikim')
    .select('id, hebrew_day, popular_name, full_name, years, image_url')
    .eq('hebrew_month', month)
    .order('hebrew_day')
  console.log(`\n=== ${month} ===`)
  for (const r of data) {
    const hasImg = r.image_url ? '✓' : ' '
    console.log(`${hasImg} יום${String(r.hebrew_day).padStart(3)} id=${r.id} | ${r.popular_name} | ${r.full_name || ''} | ${r.years || ''}`)
  }
}
