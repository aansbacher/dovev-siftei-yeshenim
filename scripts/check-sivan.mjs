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
  .select('id,popular_name,full_name,biography')
  .in('id', [11867, 11902, 11103, 11138])

data.forEach(r => {
  console.log(`id=${r.id}  name="${r.popular_name}" | full="${r.full_name}"`)
  console.log(`  bio: ${r.biography?.slice(0,100) || 'null'}`)
})
