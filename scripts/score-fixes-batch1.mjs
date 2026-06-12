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

// ענקים שנתקעו בציון 60 בטעות — מתוקן לפי מעמדם בעולם היהודי
const updates = [
  { id: 10807, importance_score: 97 }, // יוסף קארו — מחבר השולחן ערוך, אחד ממחוקקי ישראל הגדולים ביותר
  { id: 11288, importance_score: 90 }, // לוי יצחק מברדיצ'ב — "הבעל-דין של הקב"ה", מגדולי אדמורי החסידות
  { id: 10887, importance_score: 88 }, // חיים ויטאל — מרכיב עיקרי בהפצת תורת האר"י
  { id: 11504, importance_score: 85 }, // הסטייפלר — ר' יעקב ישראל קנייבסקי, מגדולי הדור
  { id: 10888, importance_score: 82 }, // יעקב עמדין (יעב"ץ) — פוסק מרכזי ולוחם נגד השבתאות
  { id: 10808, importance_score: 78 }, // משה אלשיך — האלשיך הקדוש, דרשן ומקובל צפת
]

let passed = 0, failed = 0
for (const u of updates) {
  const { error } = await sb.from('tzaddikim').update({ importance_score: u.importance_score }).eq('id', u.id)
  if (error) { console.error(`✗ ${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id}(→${u.importance_score}) `); passed++ }
}
console.log(`\n\nציונים — עודכנו: ${passed} | נכשלו: ${failed}`)
