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
const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

// Simulate exact app query for several days
for (const day of [1, 3, 5, 21]) {
  const { data } = await sb.from('tzaddikim')
    .select('id, popular_name, importance_score, biography, story, torah')
    .eq('hebrew_day', day)
    .eq('hebrew_month', 'אב')
    .order('importance_score', { ascending: false })
    .limit(4)
  console.log(`\nיום ${day} — מוחזרים ${data.length} צדיקים:`)
  for (const r of data) {
    const hasBio = r.biography ? '✓bio' : '✗bio'
    const hasStory = r.story ? '✓story' : '✗story'
    const hasTorah = r.torah ? '✓torah' : '✗torah'
    console.log(`  id=${r.id} score=${r.importance_score ?? 'null'} ${hasBio} ${hasStory} ${hasTorah} — ${(r.popular_name ?? '').slice(0, 30)}`)
  }
}
