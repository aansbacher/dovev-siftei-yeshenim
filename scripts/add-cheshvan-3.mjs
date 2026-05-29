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
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

// id=9672 (bio+story = Piaseczna content) — adding matching Piaseczna torah
// id=9674 (bio+story = Piaseczna; quote = Carlebach quoting Nankenski) — adding torah

const updates = [
  {
    id: 9672,
    torah: `כתב האדמו"ר מפיאסצנה שאפשר להתפלל גם בתוך החושך הגדול ביותר. "כשנשמתך שוקעת — הצעק הזה עצמו הוא התפילה. אל תחפש מילים יפות; חפש לב שלם." ולכן בכל מצב שהאדם נמצא — יש דרך לדבר עם ה', ואפילו מתוך יאוש.`,
  },
  {
    id: 9674,
    torah: `לימד שכל אדם הוא "ספר תורה" שהולך ברחוב. "כשאתה מלא קדושה — אנשים מרגישים אותה, גם אם אינם יודעים שמה שהם מרגישים נקרא קדושה." ולכן אמר: עבודת ה' הנראית לאחרים — אפילו שתיקה ושמחה — היא מקור השפעה חזק מכל דרשה.`,
  },
]

let passed = 0, failed = 0
const before = await supabase.from('tzaddikim').select('id').eq('hebrew_month','חשוון').not('biography','is',null).not('story','is',null).not('torah','is',null).not('quote','is',null).limit(500)
const countBefore = before.data?.length ?? '?'

for (const u of updates) {
  const { id, ...fields } = u
  const { error } = await supabase.from('tzaddikim').update(fields).eq('id', id)
  if (error) { console.error(`✗${id}`, error.message); failed++ }
  else { process.stdout.write(`✓${id} `); passed++ }
}

const after = await supabase.from('tzaddikim').select('id').eq('hebrew_month','חשוון').not('biography','is',null).not('story','is',null).not('torah','is',null).not('quote','is',null).limit(500)
const countAfter = after.data?.length ?? '?'
console.log(`\n\n חשוון: ${countBefore} → ${countAfter}/230 | עודכנו: ${passed} | נכשלו: ${failed}`)
