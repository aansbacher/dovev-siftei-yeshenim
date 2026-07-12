import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// parse .env.local manually
const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
for (const line of envFile.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k?.trim() && !k.startsWith('#')) process.env[k.trim()] = v.join('=').trim()
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const { data, error } = await supabase
  .from('tzaddikim')
  .select('id, popular_name, hebrew_month, hebrew_day, image_url, biography, story, torah, quote, importance_score')
  .order('importance_score', { ascending: false, nullsFirst: false })

if (error) { console.error(error); process.exit(1) }

const total = data.length
const withImage    = data.filter(r => r.image_url).length
const withBio      = data.filter(r => r.biography?.length > 50).length
const withStory    = data.filter(r => r.story?.length > 50).length
const withTorah    = data.filter(r => r.torah?.length > 50).length
const withQuote    = data.filter(r => r.quote?.length > 10).length
const allFilled    = data.filter(r => r.biography && r.story && r.torah && r.quote && r.image_url).length

// Image URL types
const fbImages     = data.filter(r => r.image_url?.includes('facebook') || r.image_url?.includes('fbcdn')).length
const wikiImages   = data.filter(r => r.image_url?.includes('wikipedia') || r.image_url?.includes('wikimedia')).length
const otherImages  = withImage - fbImages - wikiImages

// Sample of high-importance records with no image
const noImageTop = data.filter(r => !r.image_url).slice(0, 10)

console.log(`\n=== סטטוס בסיס הנתונים ===`)
console.log(`סה"כ רשומות: ${total}`)
console.log(`\n--- תמונות ---`)
console.log(`יש תמונה: ${withImage} (${pct(withImage, total)})`)
console.log(`  מתוך זה מפייסבוק (כנראה שבורות): ${fbImages}`)
console.log(`  מוויקיפדיה (אמינות): ${wikiImages}`)
console.log(`  אחרות: ${otherImages}`)
console.log(`אין תמונה: ${total - withImage} (${pct(total - withImage, total)})`)
console.log(`\n--- תוכן ---`)
console.log(`יש ביוגרפיה: ${withBio} (${pct(withBio, total)})`)
console.log(`יש סיפור: ${withStory} (${pct(withStory, total)})`)
console.log(`יש תורה: ${withTorah} (${pct(withTorah, total)})`)
console.log(`יש ציטוט: ${withQuote} (${pct(withQuote, total)})`)
console.log(`\n--- שלמות ---`)
console.log(`הכל מלא: ${allFilled} (${pct(allFilled, total)})`)

// By month
const months = {}
for (const r of data) {
  const m = r.hebrew_month || 'לא ידוע'
  if (!months[m]) months[m] = { total: 0, hasImg: 0, hasFull: 0 }
  months[m].total++
  if (r.image_url) months[m].hasImg++
  if (r.biography && r.story && r.torah) months[m].hasFull++
}

console.log(`\n--- לפי חודש ---`)
for (const [month, stats] of Object.entries(months).sort()) {
  console.log(`${month}: ${stats.total} רשומות | תמונה: ${stats.hasImg} | תוכן מלא: ${stats.hasFull}`)
}

console.log(`\n--- 10 חשובים ללא תמונה ---`)
for (const r of noImageTop) {
  console.log(`[${r.hebrew_month} ${r.hebrew_day}] ${r.popular_name} (score: ${r.importance_score})`)
}

function pct(n, total) { return `${Math.round(n/total*100)}%` }
