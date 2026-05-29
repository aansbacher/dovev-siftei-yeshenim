/**
 * Fetch specific records by IDs to read their existing bios
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

function parseEnv(f) {
  return fs.readFileSync(f,'utf8').split(/\r?\n/).reduce((e,l)=>{
    const c=l.trim(); if(!c||c.startsWith('#')) return e
    const [k,...r]=c.split('='); e[k.trim()]=r.join('=').trim(); return e
  },{})
}
const env = parseEnv(path.resolve('.env.local'))
const supabase = createClient(env.VITE_SUPABASE_URL?.replace(/\/rest\/v1\/?$/,''), env.SUPABASE_SERVICE_ROLE_KEY)

const ids = process.argv.slice(2).map(Number)

const { data, error } = await supabase.from('tzaddikim')
  .select('id,hebrew_day,hebrew_month,popular_name,full_name,biography,story,torah')
  .in('id', ids)
  .order('id')

if (error) { console.error(error.message); process.exit(1) }

for (const r of data) {
  console.log(`\n=== id=${r.id} [${r.hebrew_month} ${r.hebrew_day}] ${r.popular_name || r.full_name} ===`)
  if (r.biography) console.log('BIO:', r.biography.slice(0, 400))
  else console.log('BIO: (none)')
  if (r.story) console.log('STORY:', r.story.slice(0, 200))
  else console.log('STORY: (none)')
  if (r.torah) console.log('TORAH:', r.torah.slice(0, 200))
  else console.log('TORAH: (none)')
}
