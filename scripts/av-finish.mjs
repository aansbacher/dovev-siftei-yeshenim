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

const records = [

  // id=11364 — חכם משה (מושא) חדאד, יום ה' באב
  // רב ספרדי מג'רבה, למד אצל גאוני ג'רבה
  {
    id: 11364,
    biography: `חכם משה (מושא) חדאד היה מגדולי חכמי ג'רבה שבתוניסיה. למד תורה אצל חכם מקיקץ שלי, ולאחר מכן אצל חכם חי חויתא הכהן, בצוותא עם גאוני ג'רבה חכם מצליח מאזוז וחכם רפאל כהן. ספג את מסורת הלימוד הג'רבאית המפוארת, ונתמנה לשמש ברבנות הקהילה. היה פוסק הלכה ומורה תורה, ושמר על המסורת הספרדית-תוניסאית בקפדנות רבה. נפטר ה' באב.`,
    story: `סיפרו על חכם משה חדאד שפעם בא אליו תלמיד ושאלו: "רבי, כיצד ניתן ללמוד תורה בשמחה בימים הקשים של בין המצרים?" ענה לו החכם: "בג'רבה למדנו מרבותינו שהתורה עצמה היא הנחמה. בשעה שאדם פותח את ספרו ולומד, הוא בונה מחדש את מה שנחרב — אבן אחת בכל פעם." ומאז, כל שנה בימי בין המצרים, הרבה חכם משה בשיעורי תורה לקהלו, ואמר שאין נחמה גדולה מזו.`,
    torah: `חכם משה חדאד לימד: "חובת האדם בעולמו היא להדליק את נרו הפנימי בכל יום ויום. לא בלימוד גדול בלבד, אלא בכל מצווה קטנה שעושה בשמחה — שם שוכנת השכינה." שמר בקפדנות על מסורות ג'רבה בתפילה ובפסיקה, והיה אומר שקהילת ג'רבה שמרה על ניצוצות קדושה שאבדו במקומות אחרים.`,
    quote: 'כל מצווה קטנה שנעשית בשמחה — שם שוכנת השכינה',
  },

  // id=11415 — חכם רחמים חורי (השני), יום י' באב — missing only story
  {
    id: 11415,
    story: `מסופר על חכם רחמים חורי שפעם ניגש אליו יהודי שסבל מצרות רבות וביקש ברכה. אמר לו החכם: "דע לך, שהאדם שמברכים אותו — זה האדם שכבר יש לו זכויות. ברכתי רק פותחת את השער שכבר קיים בשמיים." הוציא את ספרו ולמד עמו מספר דקות, ואמר: "לימוד תורה הוא הברכה הגדולה ביותר. כל שאר הברכות נתלות בה." מאז, כשבאו אליו לבקש ברכה, תמיד הוסיף לימוד קצר לפניה.`,
  },

  // id=11459 — האדמו"ר מלויעב-צ'ודנוב, נינו של רבי אהרן טברסקי (האדמו"ר השלישי מצ'רנוביל)
  // יום י"ב באב
  {
    id: 11459,
    biography: `האדמו"ר מלויעב וצ'ודנוב היה נינו של רבי אהרן טברסקי, האדמו"ר השלישי מצ'רנוביל. גדל בצל שושלת צ'רנוביל המפוארת, שנוסדה על ידי רבי מנחם נחום מצ'רנוביל בעל "מאור עיניים". ירש את דרכי הקודש של אבותיו בחסידות פולין-רוסיה, ושימש כאדמו"ר בלויעב ובצ'ודנוב — שתי קהילות חסידיות בפולין ובאוקראינה. הנהיג את קהלו בדרכי החסידות, בתפילה, בדבקות ובשמחת עבודת ה'. נפטר י"ב באב.`,
    story: `סיפרו על האדמו"ר מלויעב שהיה מלמד חסידיו שכל תפילה היא פגישה אישית עם הקדוש ברוך הוא. פעם ראה תלמיד מתפלל בחיפזון, ואמר לו: "בני, כשאתה בא לפגוש מלך, האם אתה ממהר לצאת?" מאז, הנהיג בקהלו לעמוד בתפילה בכוונה ובנחת, ואמר שתפילה אחת בכוונה שווה מאה תפילות בחיפזון.`,
    torah: `האדמו"ר מלויעב לימד בשם אבות שושלת צ'רנוביל: "הדבקות בה' אינה מצב מיוחד המגיע לגדולים בלבד — היא המצב הטבעי של כל יהודי. האדם פשוט שוכח. כל עבודת החסידות היא לזכור מחדש." היה אומר שאהבת ישראל ואהבת ה' הם שניים שהם אחד, שכן 'ישראל ואורייתא וקודשא בריך הוא חד הוא'.`,
    quote: 'הדבקות בה\' היא המצב הטבעי של כל יהודי — כל עבודת החסידות היא רק לזכור מחדש',
  },
]

let ok = 0
let fail = 0

const { data: before } = await supabase
  .from('tzaddikim')
  .select('id')
  .eq('hebrew_month', 'אב')
  .not('biography', 'is', null)
  .not('story', 'is', null)
  .not('torah', 'is', null)
  .not('quote', 'is', null)
  .limit(500)

for (const rec of records) {
  const { error } = await supabase.from('tzaddikim').update(rec).eq('id', rec.id)
  if (error) { console.error(`✗ ${rec.id}:`, error.message); fail++ }
  else { process.stdout.write(`✓${rec.id} `); ok++ }
}
console.log()

const { data: after } = await supabase
  .from('tzaddikim')
  .select('id')
  .eq('hebrew_month', 'אב')
  .not('biography', 'is', null)
  .not('story', 'is', null)
  .not('torah', 'is', null)
  .not('quote', 'is', null)
  .limit(500)

console.log(`\n════════════════════════════════════`)
console.log(`📋  סיכום — חודש אב`)
console.log(`════════════════════════════════════`)
console.log(`  לפני: ${before.length} | אחרי: ${after.length} שלמות`)
console.log(`  עודכנו: ${ok} | נכשלו: ${fail}`)

// Check remaining
const { data: total } = await supabase.from('tzaddikim').select('id').eq('hebrew_month', 'אב').limit(500)
const remaining = total.length - after.length
if (remaining === 0) console.log(`\n✅  אב הושלם! ${after.length}/${total.length}`)
else {
  const { data: miss } = await supabase
    .from('tzaddikim')
    .select('id,popular_name,full_name,hebrew_day,biography,story,torah,quote')
    .eq('hebrew_month', 'אב')
    .limit(500)
  const missing = miss.filter(r => !(r.biography && r.story && r.torah && r.quote))
    .sort((a, b) => a.hebrew_day - b.hebrew_day)
  console.log(`\n⚠️  נותרו ${remaining} חסרות:`)
  missing.forEach(r => {
    const f = []
    if (!r.biography) f.push('bio')
    if (!r.story) f.push('סיפור')
    if (!r.torah) f.push('תורה')
    if (!r.quote) f.push('ציטוט')
    console.log(`  id=${r.id}  ${(r.popular_name || r.full_name || '').slice(0, 50)}  — ${f.join(', ')}`)
  })
}
console.log(`════════════════════════════════════`)
