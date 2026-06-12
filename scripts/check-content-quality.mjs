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

for (const month of ['סיון', 'תמוז', 'אב']) {
  const { data } = await sb.from('tzaddikim')
    .select('id, hebrew_day, popular_name, sources, story, image_url')
    .eq('hebrew_month', month)
    .order('hebrew_day').order('id')

  const total = data.length
  const withStory = data.filter(r => r.story && r.story.trim().length > 20).length
  const withSources = data.filter(r => r.sources && r.sources.length > 0).length
  const withImage = data.filter(r => r.image_url).length

  // Sample 3 records and show their sources
  const sample = data.slice(0, 3)
  console.log(`\n=== ${month} === (${total} רשומות)`)
  console.log(`  סיפור: ${withStory}/${total} | מקורות: ${withSources}/${total} | תמונה: ${withImage}/${total}`)
  for (const r of sample) {
    const src = Array.isArray(r.sources) ? r.sources.join(', ') : r.sources
    const hasStory = r.story?.length > 20 ? '✓' : '✗'
    console.log(`  ${hasStory} יום ${r.hebrew_day}: ${(r.popular_name||'').slice(0,20)} | מקורות: ${src || '—'}`)
  }
}
