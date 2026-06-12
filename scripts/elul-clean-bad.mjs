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

// Records where popular_name is a date/weekday description from Facebook posts, not a tzaddik name
const badIds = [
  11571, // "הרב אתמול יום חמישי ד' באלול ה'תשפ''א"
  11579, // "הרב יום השישי ה' באלול ה'תשפ''א"
  11590, // "הרב שבת ו' באלול ה'תשפ''א"
  11600, // "הרב אתמול יום ראשון ז' באלול ה'תשפ''א"
  11610, // "הרב אתמול יום שלישי ט' באלול ה'תשפ''א"
  11649, // "הרב יום השישי י''ב באלול ה'תשפ''א"
  11676, // "הרב יום השישי י''ט באלול ה'תשפ''א"
  11681, // "הרב שבת כ' באלול ה'תשפ''א"
  11712, // "הרב יום השישי כ''ו באלול ה'תשפ''א"
  11718, // "הרב שבת כ''ז באלול ה'תשפ''א"
]

// Preview before delete
const { data: preview } = await sb.from('tzaddikim').select('id, hebrew_day, popular_name').in('id', badIds).order('id')
console.log('רשומות למחיקה:')
for (const r of preview) console.log(`  id=${r.id} יום ${r.hebrew_day}: ${r.popular_name?.slice(0, 60)}`)

const { error } = await sb.from('tzaddikim').delete().in('id', badIds)
if (error) {
  console.error('שגיאה:', error.message)
} else {
  console.log(`\n✓ נמחקו ${badIds.length} רשומות פגומות`)
}
