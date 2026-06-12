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

// Fetch records missing more than just quote
const ids = [11187,11219,11232,11279,11284,11287,11260,11266,11897,11869,11904,11325]
const { data } = await supabase
  .from('tzaddikim')
  .select('id,popular_name,full_name,hebrew_day,biography,story,torah,quote')
  .in('id', ids)

data.sort((a,b)=>a.hebrew_day - b.hebrew_day).forEach(r => {
  console.log(`\n[${r.hebrew_day}] id=${r.id}  ${r.popular_name}`)
  console.log(`  bio:   ${r.biography?.slice(0,120) || '∅'}`)
  console.log(`  story: ${r.story?.slice(0,100) || '∅'}`)
  console.log(`  torah: ${r.torah?.slice(0,100) || '∅'}`)
  console.log(`  quote: ${r.quote?.slice(0,80) || '∅'}`)
})
