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

const ids = [10371,11777,11779,11781,10418,10413,10417,10445,10449,11782,10451,10465,11885,11887,11814,11888,11783,11784,11889,11785,10548,10545,10547,10553,10505,10551,11786,11928,11857,11789,11774,11790,11858]
const { data } = await supabase
  .from('tzaddikim')
  .select('id,popular_name,full_name,hebrew_day,biography,story,torah,quote')
  .in('id', ids)
  .order('hebrew_day')

data.forEach(r => {
  console.log(`\n=== [${r.hebrew_day}] id=${r.id} ===`)
  console.log(`name: ${(r.popular_name || r.full_name || '').slice(0,55)}`)
  console.log(`bio: ${(r.biography||'').slice(0,80)}`)
  console.log(`story: ${(r.story||'').slice(0,80)}`)
  console.log(`torah: ${(r.torah||'').slice(0,80)}`)
  console.log(`quote: ${(r.quote||'').slice(0,80)}`)
})
