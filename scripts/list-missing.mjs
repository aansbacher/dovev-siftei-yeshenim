/**
 * List records missing biography/story/torah for a given month
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

const month = process.argv[2] || 'תמוז'

const { data, error } = await supabase.from('tzaddikim')
  .select('id,hebrew_day,hebrew_month,popular_name,full_name,biography,story,torah')
  .eq('hebrew_month', month)
  .order('hebrew_day', { ascending: true })

if (error) { console.error(error.message); process.exit(1) }

const missing = data.filter(r => !r.biography || !r.story || !r.torah)
console.log(`\n${month}: ${data.length} total, ${missing.length} missing content\n`)

for (const r of missing) {
  const name = r.popular_name || r.full_name || '?'
  const hasBio = r.biography ? '✓' : '✗'
  const hasStory = r.story ? '✓' : '✗'
  const hasTorah = r.torah ? '✓' : '✗'
  console.log(`  id=${r.id} [${r.hebrew_day}] bio:${hasBio} story:${hasStory} torah:${hasTorah}  ${name}`)
}
