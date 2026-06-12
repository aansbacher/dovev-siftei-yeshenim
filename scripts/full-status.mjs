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
const env = parseEnv(path.resolve('c:/Users/aansb/dovev-siftei-yeshenim/.env.local'))
const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const { data, error } = await sb
  .from('tzaddikim')
  .select('id, popular_name, importance_score, image_url, story, torah, biography, hebrew_month')
  .order('importance_score', { ascending: false, nullsFirst: false })

if (error) { console.error(error); process.exit(1) }

const total = data.length
const withImage = data.filter(r => r.image_url).length
const withStory = data.filter(r => r.story && r.story.length > 100).length
const withTorah = data.filter(r => r.torah && r.torah.length > 100).length
const withBio = data.filter(r => r.biography && r.biography.length > 100).length

console.log(`\n=== סטטוס כללי (${total} רשומות) ===`)
console.log(`תמונות: ${withImage}/${total} (${Math.round(withImage/total*100)}%)`)
console.log(`סיפורים: ${withStory}/${total} (${Math.round(withStory/total*100)}%)`)
console.log(`תורות: ${withTorah}/${total} (${Math.round(withTorah/total*100)}%)`)
console.log(`ביוגרפיות: ${withBio}/${total} (${Math.round(withBio/total*100)}%)`)

// By score bands
const bands = [
  { label: 'טופ (90-100)', min: 90, max: 100 },
  { label: 'גבוה (80-89)', min: 80, max: 89 },
  { label: 'בינוני-גבוה (70-79)', min: 70, max: 79 },
  { label: 'בינוני (60-69)', min: 60, max: 69 },
]

console.log('\n=== לפי רמת ציון ===')
for (const b of bands) {
  const recs = data.filter(r => r.importance_score >= b.min && r.importance_score <= b.max)
  const img = recs.filter(r => r.image_url).length
  const st = recs.filter(r => r.story && r.story.length > 100).length
  const to = recs.filter(r => r.torah && r.torah.length > 100).length
  console.log(`\n${b.label} — ${recs.length} רשומות`)
  console.log(`  תמונה: ${img}/${recs.length} | סיפור: ${st}/${recs.length} | תורה: ${to}/${recs.length}`)
  if (img < recs.length) {
    const missing = recs.filter(r => !r.image_url).map(r => `  ✗ [${r.id}] ${r.popular_name} (${r.importance_score})`)
    console.log('  חסרות תמונות:')
    missing.forEach(m => console.log(m))
  }
}

// Missing story in 80+
console.log('\n=== ציון 80+ ללא סיפור ===')
const high = data.filter(r => r.importance_score >= 80)
high.filter(r => !r.story || r.story.length <= 100).forEach(r =>
  console.log(`  [${r.id}] ${r.popular_name} (${r.importance_score})`)
)

// Missing torah in 80+
console.log('\n=== ציון 80+ ללא תורה ===')
high.filter(r => !r.torah || r.torah.length <= 100).forEach(r =>
  console.log(`  [${r.id}] ${r.popular_name} (${r.importance_score})`)
)

// Short torah in 80+ (under 200 chars)
console.log('\n=== ציון 80+ עם תורה קצרה (מתחת ל-200 תווים) ===')
high.filter(r => r.torah && r.torah.length > 0 && r.torah.length < 200).forEach(r =>
  console.log(`  [${r.id}] ${r.popular_name} (${r.importance_score}) — ${r.torah.length} תווים`)
)
