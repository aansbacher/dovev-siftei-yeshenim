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

// Inspect suspicious day-30 records + famous ones
const ids = [9607, 9601, 9602, 9604, 9606, 9592, 9593, 9586, 11807,
             11886, 11927, 11806, 9394, 11910, 14, 9408]
const { data } = await supabase
  .from('tzaddikim')
  .select('id,popular_name,full_name,hebrew_day,biography,story,torah,quote')
  .in('id', ids)

data.sort((a, b) => a.hebrew_day - b.hebrew_day).forEach(r => {
  console.log(`\n[${r.hebrew_day}] id=${r.id}`)
  console.log(`  name:  ${r.popular_name || r.full_name || '∅'}`)
  console.log(`  bio:   ${r.biography?.slice(0, 120) || '∅'}`)
  console.log(`  story: ${r.story?.slice(0, 80) || '∅'}`)
  console.log(`  torah: ${r.torah?.slice(0, 80) || '∅'}`)
  console.log(`  quote: ${r.quote?.slice(0, 80) || '∅'}`)
})
