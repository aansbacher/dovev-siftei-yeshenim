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

for (const month of ['סיון', 'תמוז']) {
  const { data } = await supabase
    .from('tzaddikim')
    .select('id, hebrew_day, popular_name, biography, story, torah, quote, image_url, sources')
    .eq('hebrew_month', month)
    .order('hebrew_day')

  let complete = 0, hasImage = 0
  const incomplete = []

  for (const r of data) {
    const ok = r.biography && r.story && r.torah && r.quote
    if (ok) complete++
    else {
      const missing = []
      if (!r.biography) missing.push('bio')
      if (!r.story) missing.push('story')
      if (!r.torah) missing.push('torah')
      if (!r.quote) missing.push('quote')
      incomplete.push(`  יום ${r.hebrew_day} id=${r.id} ${r.popular_name||''} — חסר: ${missing.join(', ')}`)
    }
    if (r.image_url) hasImage++
  }

  console.log(`\n=== ${month} ===`)
  console.log(`${data.length} רשומות | שלמות: ${complete}/${data.length} | עם תמונה: ${hasImage}/${data.length}`)
  if (incomplete.length) {
    console.log('לא שלמות:')
    incomplete.forEach(l => console.log(l))
  } else {
    console.log('✓ כולן שלמות!')
  }
}
