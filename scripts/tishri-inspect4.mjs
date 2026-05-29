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

const ids = [9530,9532,9533,9536,9537,11805,
             9564,9545,9548,9546,9549,9541,9558,9550,
             9579,9578,11880,11912,
             9586,9592,9593,11807]
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
  console.log(`[${r.hebrew_day}] id=${r.id}  ${(r.popular_name||r.full_name||'').slice(0,55)}  — חסר: ${f.join(',')}`)
  if (r.biography) console.log(`  bio: ${r.biography.slice(0,100)}`)
})
