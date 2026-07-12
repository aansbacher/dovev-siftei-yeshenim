/**
 * Rewrites biography/story/torah/quote for top tzaddikim using Claude + web search.
 * Run with: node scripts/rewrite-content.mjs [limit] [offset]
 * Example:  node scripts/rewrite-content.mjs 50 0
 */
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
for (const line of envFile.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k?.trim() && !k.startsWith('#')) process.env[k.trim()] = v.join('=').trim()
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LIMIT  = parseInt(process.argv[2] ?? '30')
const OFFSET = parseInt(process.argv[3] ?? '0')

const { data, error } = await supabase
  .from('tzaddikim')
  .select('id, popular_name, full_name, years, stream, role, biography, story, torah, quote')
  .order('importance_score', { ascending: false, nullsFirst: false })
  .range(OFFSET, OFFSET + LIMIT - 1)

if (error) { console.error(error); process.exit(1) }

console.log(`מעבד ${data.length} צדיקים (offset=${OFFSET})...\n`)

async function rewrite(tzaddik) {
  const existing = [
    tzaddik.biography ? `ביוגרפיה קיימת: ${tzaddik.biography}` : '',
    tzaddik.story     ? `סיפור קיים: ${tzaddik.story}` : '',
    tzaddik.torah     ? `תורה קיימת: ${tzaddik.torah}` : '',
    tzaddik.quote     ? `ציטוט קיים: ${tzaddik.quote}` : '',
  ].filter(Boolean).join('\n')

  const prompt = `כתוב מחדש את המידע על הצדיק הבא. חפש מידע מאומת ב-Web לפני שאתה כותב.

שם: ${tzaddik.popular_name}
שם מלא: ${tzaddik.full_name ?? ''}
שנים: ${tzaddik.years ?? ''}
זרם: ${tzaddik.stream ?? ''}
תפקיד: ${tzaddik.role ?? ''}

${existing}

כתוב JSON בדיוק בפורמט הבא (בעברית, ללא הערות):
{
  "biography": "2-3 משפטים עובדתיים וחדים על מי היה, מה עשה, מדוע חשוב. ללא אמירות כלליות.",
  "story": "סיפור אחד ספציפי ומרתק מחייו. לא כללי — אירוע ממשי עם פרטים.",
  "torah": "תורה אחת ממוקדת ובעלת עומק. ישירה ומעוררת מחשבה.",
  "quote": "אמרה קצרה אחת מפורסמת שלו. עד 20 מילה. אם לא קיימת — כתוב null."
}

אם אין לך מידע מאומת לאחד השדות — כתוב null. אל תמציא.`

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    messages: [{ role: 'user', content: prompt }],
    system: 'אתה עוזר שכותב תוכן מאומת על צדיקי ישראל. חפש ב-Web לפני כל תשובה. השב ב-JSON בלבד ללא הסברים.',
  })

  // Extract JSON from text blocks
  const text = msg.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in response')
  return JSON.parse(jsonMatch[0])
}

let updated = 0
let failed  = 0

for (const tzaddik of data) {
  try {
    process.stdout.write(`⏳ ${tzaddik.popular_name}... `)
    const result = await rewrite(tzaddik)

    const update = {}
    if (result.biography) update.biography = result.biography
    if (result.story)     update.story     = result.story
    if (result.torah)     update.torah     = result.torah
    if (result.quote)     update.quote     = result.quote

    if (Object.keys(update).length > 0) {
      const { error: err } = await supabase
        .from('tzaddikim')
        .update(update)
        .eq('id', tzaddik.id)

      if (err) throw err
    }

    console.log(`✓`)
    updated++
  } catch (e) {
    console.log(`✗ ${e.message}`)
    failed++
  }

  // Delay between calls to avoid rate limiting
  await new Promise(r => setTimeout(r, 1500))
}

console.log(`\nסיום: עודכנו ${updated} | נכשלו ${failed}`)
