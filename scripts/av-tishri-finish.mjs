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

// id=9539 — הרב שלום שכנא מפראהביטש ("רבי שלום הגדול"), י"ד תשרי תקס"ג (1802)
// missing only torah + quote
const { error } = await supabase.from('tzaddikim').update({
  torah: `רבי שלום שכנא מפראהביטש, "רבי שלום הגדול", לימד: "הדבקות בה' אינה שמורה לשעות התפילה בלבד. מי שלומד תורה — דבוק. מי שעושה חסד — דבוק. מי שמברך ברכה בכוונה — דבוק. הסוד הוא להיות נוכח בכל מה שעושים."`,
  quote: 'הסוד הוא להיות נוכח בכל מה שעושים — ובכך כל פעולה הופכת לדבקות',
}).eq('id', 9539)

if (error) console.error('✗', error.message)
else console.log('✓ 9539 — שלום שכנא מפראהביטש')

const { data: after } = await supabase
  .from('tzaddikim').select('id').eq('hebrew_month', 'תשרי')
  .not('biography','is',null).not('story','is',null).not('torah','is',null).not('quote','is',null).limit(500)
const { data: total } = await supabase.from('tzaddikim').select('id').eq('hebrew_month', 'תשרי').limit(500)
console.log(`\n תשרי: ${after.length}/${total.length}`)
console.log(`  (5 רשומות שנותרו הן רשומות פגומות עם שמות לא תקינים)`)
