/**
 * Fix bad records in Sivan:
 * 1. Clear garbage biographies (day-headers, wrong person's content, date-only content)
 * 2. Fix bad full_name / popular_name fields
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

function parseEnv(filePath) {
  const text = fs.readFileSync(filePath, 'utf8')
  return text.split(/\r?\n/).reduce((env, line) => {
    const cleaned = line.trim()
    if (!cleaned || cleaned.startsWith('#')) return env
    const [key, ...rest] = cleaned.split('=')
    env[key.trim()] = rest.join('=').trim()
    return env
  }, {})
}

const env = parseEnv(path.resolve('.env.local'))
const supabaseUrl = env.VITE_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, '')
const supabase = createClient(supabaseUrl, env.SUPABASE_SERVICE_ROLE_KEY)

const updates = [
  // Fix garbled names
  { id: 11072, popular_name: 'הרב חיים יצחק קארב', biography: null },
  { id: 11074, full_name: 'רבי יוסף בן עמנואל אירגאס', popular_name: 'רבי יוסף אירגאס' },
  { id: 11083, full_name: 'רבי קלונימוס קלמן בן רבי יוסף ברוך מניישטאט', popular_name: 'רבי קלונימוס קלמן מניישטאט', biography: null },
  { id: 11090, popular_name: 'רבי ישכר בעריש אייכנשטיין', biography: null },
  { id: 11103, biography: null },
  { id: 11110, full_name: 'רבי יהודה זונדל הגר', popular_name: 'רבי יהודה זונדל הגר' },
  { id: 11116, biography: null },
  { id: 11122, biography: null },
  { id: 11131, biography: null },
  { id: 11138, biography: null },  // chess player content - wrong
  { id: 11148, full_name: 'רבי נפתלי צבי ממויסליץ', popular_name: 'רבי נפתלי צבי ממויסליץ' },
  { id: 11151, full_name: 'רבי משולם פייש סגל-לאווי', popular_name: 'רבי משולם פייש מטאהש' },
  { id: 11158, biography: null },
  // 11902 "הרב גדליהו" - incomplete/junk record, clear garbage bio
  { id: 11902, biography: null },
]

async function main() {
  let ok = 0, fail = 0
  for (const { id, ...fields } of updates) {
    const { error } = await supabase.from('tzaddikim').update(fields).eq('id', id)
    if (error) { console.error(`✗ id=${id}: ${error.message}`); fail++ }
    else { console.log(`✓ id=${id}`); ok++ }
  }
  console.log(`\nDone: ${ok} updated, ${fail} errors`)
}

main().catch(err => { console.error(err); process.exit(1) })
