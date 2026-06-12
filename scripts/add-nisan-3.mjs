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
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

// [21] id=10876 — רבי ישכר בעריש איינשטיין מזידיטשוב — story only
const { error } = await supabase.from('tzaddikim').update({
  story: `מסופר על רבי ישכר בעריש איינשטיין מזידיטשוב שחסיד בא לפניו ביום כיפור ואמר: "רבי, כל שנה אני עושה תשובה ושוב אני חוטא. מה הועיל?" ענה הרב: "שאל את עצמך — האם בשנה הזו חטאת פחות מהשנה שעברה?" שתה ואמר: "כן, קצת." ענה: "אם כן — התשובה הועילה. לא ביקשתי שתהיה מלאך. ביקשתי שתהיה טוב יותר בכל שנה."`,
}).eq('id', 10876)

if (error) console.error('✗10876', error.message)
else console.log('✓10876')

const after = await supabase.from('tzaddikim').select('id').eq('hebrew_month','ניסן').not('biography','is',null).not('story','is',null).not('torah','is',null).not('quote','is',null).limit(500)
console.log(`\n ניסן: ${after.data?.length}/134`)
