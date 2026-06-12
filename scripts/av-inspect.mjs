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

// Focus on records missing bio (some of the most famous rabbis)
const ids = [11404,11463,11797,11926,11345,11347,11383,11392,11387,11380,11803,11449,11456,11796]
const { data } = await supabase
  .from('tzaddikim')
  .select('id,popular_name,full_name,hebrew_day,biography,story,torah,quote')
  .in('id', ids)

data.sort((a,b)=>a.hebrew_day - b.hebrew_day).forEach(r => {
  console.log(`\n[${r.hebrew_day}] id=${r.id}  ${r.popular_name}`)
  console.log(`  bio:   ${r.biography?.slice(0,100) || '∅'}`)
  console.log(`  story: ${r.story?.slice(0,80) || '∅'}`)
  console.log(`  torah: ${r.torah?.slice(0,80) || '∅'}`)
  console.log(`  quote: ${r.quote?.slice(0,80) || '∅'}`)
})
