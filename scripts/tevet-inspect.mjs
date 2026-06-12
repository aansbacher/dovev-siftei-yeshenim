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

const ids = [10159, 10174, 10193, 10222, 10252, 10255, 11768, 11769, 10323, 11770, 11771, 11773, 11792, 11766, 11761, 11913]
const { data } = await supabase
  .from('tzaddikim')
  .select('id,popular_name,full_name,hebrew_day,biography,story,torah,quote')
  .in('id', ids)
  .order('hebrew_day')

data.forEach(r => {
  console.log(`\n=== [${r.hebrew_day}] id=${r.id} ===`)
  console.log(`name: ${r.popular_name || r.full_name}`)
  console.log(`bio: ${(r.biography||'').slice(0, 120)}`)
  console.log(`story: ${(r.story||'').slice(0, 120)}`)
  console.log(`torah: ${(r.torah||'').slice(0, 120)}`)
  console.log(`quote: ${(r.quote||'').slice(0, 120)}`)
})
