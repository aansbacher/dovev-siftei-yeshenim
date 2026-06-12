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

const ids = [
  10643,11791,10652,10644,10634,10658,10662,10651,10653,10665,
  11859,11860,11861,11894,11895,11896,11919,11898,11855,
  10677,10758 // the ones needing only quote
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
  console.log(`[${r.hebrew_day}] id=${r.id}  ${(r.popular_name||r.full_name||'').slice(0,60)}  — חסר: ${f.join(',')}`)
  if (r.biography) console.log(`  bio: ${r.biography.slice(0,100)}`)
  if (r.quote && !r.story) console.log(`  quo: ${r.quote.slice(0,80)}`)
})
