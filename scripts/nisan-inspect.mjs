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

const ids = [11802,10766,10775,10782,10783,10787,11793,10876,11788,10852,11921,10871,11808,10831,10827,10819,10846,10868,10892]
const { data } = await supabase
  .from('tzaddikim')
  .select('id,popular_name,full_name,hebrew_day,biography,story,torah,quote')
  .in('id', ids)
  .order('hebrew_day')

data.forEach(r => {
  console.log(`\n=== [${r.hebrew_day}] id=${r.id} ===`)
  console.log(`name: ${r.popular_name || r.full_name}`)
  console.log(`bio: ${(r.biography||'').slice(0,100)}`)
  console.log(`story: ${(r.story||'').slice(0,100)}`)
  console.log(`torah: ${(r.torah||'').slice(0,100)}`)
  console.log(`quote: ${(r.quote||'').slice(0,100)}`)
})
