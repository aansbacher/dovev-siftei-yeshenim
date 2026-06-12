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

const heavyDays = [2, 6, 8, 9, 10, 20]

for (const day of heavyDays) {
  const { data } = await supabase
    .from('tzaddikim')
    .select('id,popular_name,full_name,biography,sources')
    .eq('hebrew_month', 'תמוז')
    .eq('hebrew_day', day)
    .order('id')

  console.log(`\n===== יום ${day} תמוז — ${data.length} רשומות =====`)
  for (const r of data) {
    const name = r.popular_name || r.full_name || '(ללא שם)'
    const bio = (r.biography || '').slice(0, 120)
    const src = r.sources || '—'
    console.log(`  id=${r.id} | ${name}`)
    console.log(`    bio: ${bio}`)
    console.log(`    src: ${src}`)
  }
}
