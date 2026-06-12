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
  .select('id,popular_name,full_name,hebrew_day,biography,story,torah,quote')
  .eq('hebrew_month', 'חשוון')
  .limit(500)

const missing = data.filter(r => !(r.biography && r.story && r.torah && r.quote))
  .sort((a, b) => a.hebrew_day - b.hebrew_day)

console.log(`\n📋 חסרות בחשוון: ${missing.length} רשומות\n`)
missing.forEach(r => {
  const fields = []
  if (!r.biography) fields.push('bio')
  if (!r.story)     fields.push('סיפור')
  if (!r.torah)     fields.push('תורה')
  if (!r.quote)     fields.push('ציטוט')
  console.log(`[${r.hebrew_day}] id=${r.id}  ${(r.popular_name || r.full_name || '').slice(0, 48)}  — חסר: ${fields.join(', ')}`)
})
