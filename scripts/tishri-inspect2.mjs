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
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

const ids = [
  9427,9430,9424, // day 7
  9439,9433,9432,9437,9441,9435,9438, // day 8
  9447,9460,9451,9455,9454,9453,9448,9450,9445,9446,9449,9457,9458, // day 9
]
const { data } = await supabase
  .from('tzaddikim')
  .select('id,popular_name,full_name,hebrew_day,biography,story,torah,quote')
  .in('id', ids)

data.sort((a, b) => a.hebrew_day - b.hebrew_day).forEach(r => {
  const f = []
  if (!r.biography) f.push('bio')
  if (!r.story) f.push('סיפור')
  if (!r.torah) f.push('תורה')
  if (!r.quote) f.push('ציטוט')
  console.log(`[${r.hebrew_day}] id=${r.id}  ${(r.popular_name||r.full_name||'').slice(0,50)}  — חסר: ${f.join(',')}`)
  if (r.biography) console.log(`  bio: ${r.biography.slice(0,100)}`)
  if (r.torah) console.log(`  tor: ${r.torah.slice(0,80)}`)
  if (r.quote) console.log(`  quo: ${r.quote.slice(0,80)}`)
})
