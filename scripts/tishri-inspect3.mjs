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
  9471,9464,9493,9496,9492,9486,9484,9463,9487,9508,9509,
  9472,9470,9505,9495,9466,9503,9507,9485,9483,9465,9467,9527,
  // also remaining: 9530, 9532, 9533, 9536, 9537, 11805, 11880, 11912
  9530,9532,9533,9536,9537,11805,11880,11912
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
  console.log(`[${r.hebrew_day}] id=${r.id}  ${(r.popular_name||r.full_name||'').slice(0,55)}  — חסר: ${f.join(',')}`)
})
