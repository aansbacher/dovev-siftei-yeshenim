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

const updates = [
  // ר' ישראל מרוז'ין (11828)
  {
    id: 11828,
    torah: `"עבודת ה' אינה בפרישות מן העולם — אלא בקידוש העולם מתוכו." כך לימד ר' ישראל מרוז'ין. על הכרכרה המפוארת אמר: "אני יודע שאני עפר ואפר — אבל כבוד ישראל הוא כבוד שמיים." ועל שמחה: "שמחת הצדיק — היא שמחת כל ישראל. מי שמרגיש שהוא בן מלך — חי כבן מלך." ועל גלות: "כשיהודי שמח — הוא מקצר את הגלות."`,
  },
  // מהרי"ל — ר' יעקב מולין (12111)
  {
    id: 12111,
    torah: `"מנהג ישראל — תורה הוא." (ספר המהרי"ל). ר' יעקב מולין קבע: "מנהג אבות שנהגו בו שנים רבות — אסור לשנות, אפילו נראה כטעות." ועל חזנות: "שליח ציבור שאינו מכוון — כסנאי לפני המלך." ועוד: "כל ישראל יש להם חלק — אפילו מי שנטה מן הדרך. אבינו שבשמיים אינו מוותר עליהם." (מנהגי מהרי"ל)`,
  },
]

let passed = 0, failed = 0
for (const u of updates) {
  const { error } = await sb.from('tzaddikim').update({ torah: u.torah }).eq('id', u.id)
  if (error) { console.error(`✗ ${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}
console.log(`\n\nתורות — עודכנו: ${passed} | נכשלו: ${failed}`)
