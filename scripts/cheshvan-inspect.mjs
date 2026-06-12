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

const ids = [11804,9650,9648,9649,9659,9660,9664,11731,9672,9674,9701,9754,9761,9738,9740,9739,9777,11809,11820,11738,11743,11746,11842,11741,11736,11795,11831,11739,11883,11828,11849,11850,11851]
const { data } = await supabase
  .from('tzaddikim')
  .select('id,popular_name,full_name,hebrew_day,biography,story,torah,quote')
  .in('id', ids)
  .order('hebrew_day')

data.forEach(r => {
  console.log(`\n=== [${r.hebrew_day}] id=${r.id} ===`)
  console.log(`name: ${(r.popular_name || r.full_name || '').slice(0,60)}`)
  console.log(`bio: ${(r.biography||'').slice(0,80)}`)
  console.log(`story: ${(r.story||'').slice(0,80)}`)
  console.log(`torah: ${(r.torah||'').slice(0,80)}`)
  console.log(`quote: ${(r.quote||'').slice(0,80)}`)
})
