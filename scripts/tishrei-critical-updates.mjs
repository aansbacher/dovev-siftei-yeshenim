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
  {
    id: 9491,
    importance_score: 97,
    story: 'רבי נחמן מברסלב (א׳ ניסן תקל״ב – י״ח תשרי תקע״א, 1772–1810) היה ניצן מגזע הבעל שם טוב — נינו. ייסד את חסידות ברסלב, שהדגישה שמחה, תפילה בהתבודדות ואמונה פשוטה. ידוע בי״ג סיפורי המעשיות שלו — ספרות הסיפור החסידית העמוקה ביותר. אמר: "כל העולם כולו גשר צר מאוד, והעיקר לא לפחד כלל". נפטר בביקורו באומן ונקבר שם. מדי ראש השנה עולים עשרות אלפי חסידי ברסלב לקבורתו.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Rabbi_Nahman_Tomb_%28Uman%2C_Ukraine%29.JPG/400px-Rabbi_Nahman_Tomb_%28Uman%2C_Ukraine%29.JPG',
  },
  {
    id: 9515,
    importance_score: 95,
    story: 'רבי עקיבא בן יוסף היה מגדולי התנאים ומאחד עשרת הרוגי מלכות. עד גיל ארבעים לא למד תורה, ולאחר שהתחיל ללמוד נעשה לגדול הדור. תלמידיו — רבי מאיר, רבי יהודה, רבי שמעון — הם מייסדי המשנה. נהרג בידי הרומאים, ויצאה נשמתו באמירת "אחד" בקריאת שמע. אמרו עליו: "כשראה משה רבנו את תורתו, אמר — לי תתן שכרו".',
  },
  {
    id: 10223,
    importance_score: 82,
    story: 'רבי נתן שטרנהרץ מברסלב, המוכר כ"מוהרנ״ת" (טבת י׳ תקמ׳א – טבת י׳ תרט״ו), היה תלמידו הנאמן והמסור ביותר של רבי נחמן. כינה את עצמו "הספרן" של רבו. ללא יגיעתו לא הייתה חסידות ברסלב ממשיכה — הוא כתב, ערך והדפיס את "ליקוטי מוהר״ן", "שבחי הר״ן", ואת י״ג סיפורי המעשיות. ייסד את המנהג של עלייה לאומן בראש השנה.',
  },
  {
    id: 9435,
    importance_score: 74,
    story: 'רבי יקותיאל יהודה הלברשטאם מברדיוב-וויליאמסבורג היה מגדולי אדמו"רי שושלת הלברשטאם בדורות האחרונים, ושמר על מסורות חסידות צאנז בארצות הברית. נפטר בח׳ תשרי.',
  },
]

let passed = 0, failed = 0

for (const u of updates) {
  const upd = {}
  if (u.importance_score !== undefined) upd.importance_score = u.importance_score
  if (u.story !== undefined) upd.story = u.story
  if (u.image_url !== undefined) upd.image_url = u.image_url
  const { error } = await sb.from('tzaddikim').update(upd).eq('id', u.id)
  if (error) { console.error(`✗ ${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}

console.log(`\n\nעודכנו: ${passed} | נכשלו: ${failed}`)

// Also fix Tevet score=5 baseline while we're here
const { error: tevErr } = await sb.from('tzaddikim').update({ importance_score: 60 }).eq('hebrew_month', 'טבת').eq('importance_score', 5)
if (tevErr) console.error('✗ טבת baseline:', tevErr.message)
else console.log('✓ טבת ← baseline 60 לכל ציון=5')
