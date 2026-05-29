/**
 * Clear biography/story/torah fields that contain day-header garbage,
 * date-only content, or chess-player content (wrong person).
 * These come from Facebook group posts where the entire day's list was copy-pasted.
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

function parseEnv(filePath) {
  return fs.readFileSync(filePath, 'utf8').split(/\r?\n/).reduce((env, line) => {
    const c = line.trim()
    if (!c || c.startsWith('#')) return env
    const [k, ...r] = c.split('=')
    env[k.trim()] = r.join('=').trim()
    return env
  }, {})
}

const env = parseEnv(path.resolve('.env.local'))
const supabase = createClient(
  env.VITE_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, ''),
  env.SUPABASE_SERVICE_ROLE_KEY
)

// Patterns that indicate garbage / wrong content
const DAY_HEADER = /היום\s+יום\s+(ראשון|שני|שלישי|רביעי|חמישי|שישי|שבת)|יום\s+(ראשון|שני|שלישי|רביעי|חמישי|שישי|שבת)\s+[א-ת]|^-\s*הרב|^-\s*רבי|^\s*[-–]\s*(הרב|רבי|חכם)/m
const DATE_ONLY = /^\s*[(\[]\s*[0-9]{4}|^\s*[(\[]\s*ה'/
const CHESS = /שחמטאי|chess|Chess/i
const TOO_SHORT = 15

function isBad(val) {
  if (!val || val.trim().length < TOO_SHORT) return false
  return DAY_HEADER.test(val) || DATE_ONLY.test(val) || CHESS.test(val)
}

// Fetch all records
let all = [], from = 0
while (true) {
  const { data, error } = await supabase.from('tzaddikim')
    .select('id,popular_name,full_name,hebrew_month,hebrew_day,biography,story,torah')
    .range(from, from + 999)
  if (error) { console.error(error.message); process.exit(1) }
  if (!data || data.length === 0) break
  all.push(...data)
  from += 1000
  if (data.length < 1000) break
}
console.log(`Loaded ${all.length} records`)

// Build list of updates needed
const updates = []
for (const r of all) {
  const patch = {}
  if (isBad(r.biography)) patch.biography = null
  if (isBad(r.story)) patch.story = null
  if (isBad(r.torah)) patch.torah = null
  if (Object.keys(patch).length > 0) {
    updates.push({ id: r.id, name: (r.popular_name || r.full_name || '').slice(0, 35), month: r.hebrew_month, day: r.hebrew_day, patch })
  }
}

console.log(`\nRecords to fix: ${updates.length}`)
for (const u of updates) {
  const fields = Object.keys(u.patch).join(', ')
  console.log(`  id=${u.id} [${u.month} ${u.day}] ${u.name} — clear: ${fields}`)
}

// Apply updates
console.log('\nApplying...')
let ok = 0, fail = 0
for (const { id, patch } of updates) {
  const { error } = await supabase.from('tzaddikim').update(patch).eq('id', id)
  if (error) { console.error(`✗ id=${id}: ${error.message}`); fail++ }
  else { ok++ }
}
console.log(`\nDone: ${ok} cleared, ${fail} errors`)
