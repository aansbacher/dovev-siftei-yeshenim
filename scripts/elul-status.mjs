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

const { data } = await sb.from('tzaddikim')
  .select('id, hebrew_day, popular_name, image_url, story')
  .eq('hebrew_month', 'אלול')
  .order('hebrew_day').order('id')

const days = [...new Set(data.map(r => r.hebrew_day))]
const missing = Array.from({length: 29}, (_, i) => i + 1).filter(d => !days.includes(d))
const withImage = data.filter(r => r.image_url)
const withStory = data.filter(r => r.story && r.story.length > 20)

console.log(`סה"כ רשומות: ${data.length}`)
console.log(`ימים מכוסים: ${days.length}/29`)
console.log(`עם תמונה: ${withImage.length}/${data.length}`)
console.log(`עם סיפור: ${withStory.length}/${data.length}`)
console.log(`\nימים חסרים (${missing.length}): ${missing.join(', ')}`)
console.log('\nכל הרשומות:')
for (const r of data) {
  const img = r.image_url ? '🖼' : '  '
  const story = r.story?.length > 20 ? '📖' : '  '
  console.log(`  ${img}${story} יום ${String(r.hebrew_day).padStart(2)} id=${r.id}: ${r.popular_name}`)
}
