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

// =================== ציונות מפורטות ===================
const specificUpdates = [
  // =================== תשרי ===================

  // ר' ישראל פרלוב מסטולין (הינוקא) — ב' תשרי
  { id: 9394, importance_score: 82, story: 'רבי ישראל פרלוב מסטולין, הידוע כ"ינוקא" (ב\' תשרי תרנ"ב), היה האדמו"ר השני של חסידות קרלין-סטולין. כיהן בתפקיד מגיל ששה שנים לאחר מות אביו — ומכאן כינויו "ינוקא". ידוע בלהב תפילתו ובעומק חסידותו. תורתו נאמרת עד היום בעשרות בתי מדרש של חסידות קרלין-סטולין.' },

  // סבא משפולי — ו' תשרי
  { id: 9422, importance_score: 85, story: 'רבי אריה לייב "הסבא משפולי" (ו\' תשרי תק"ן) היה מגדולי תלמידי הבעל שם טוב ומאדמו"רי הדור השני של החסידות. ידוע בהומור הקדוש שלו ובאהבתו העמוקה לכל יהודי, ובמיוחד לפשוטי העם. ספרו של מרן המגיד ממזריטש נשלח אליו בחייו כסימן חשיבות. סיפוריו על אהבת ישראל עוברים מדור לדור.' },

  // מאיר אריק — פוסק גליציה, ט' תשרי
  { id: 9451, importance_score: 76, story: 'הרב מאיר אריק זצ"ל (ט\' תשרי תרפ"ה) היה מגדולי פוסקי ההלכה בגליציה בתחילת המאה ה-20. חיבר ספרי שו"ת ידועים ושימש כרב בתרנוב. ידוע בחריפות פסיקתו ובדרכו הנוחה בה פנו אליו שואלים מכל קצות גליציה.' },

  // יקותיאל יהודה הלברשטאם — קלויזנבורג, ח' תשרי
  { id: 9435, importance_score: 88, story: 'הרב יקותיאל יהודה הלברשטאם זצ"ל, האדמו"ר מקלויזנבורג (ח\' תשרי תשנ"ד), היה מגדולי אדמו"רי דורנו, שורד השואה שאיבד את אשתו ו-11 ילדיו ובנה מחדש את עצמו ואת קהילתו. ייסד עיר בפני עצמה — "קרית צאנז" בנתניה — כולל ישיבה, בית חולים ושכונה. אמר: "אנחנו הלכנו דרך גיהנום, אבל ה\' עמדנו".' },

  // =================== שבט ===================

  // ר' משולם זושא מאניפולי — א' שבט (ספק בתאריך)
  { id: 10360, importance_score: 88, story: 'רבי משולם זושא מאניפולי (ב\' שבט תק"ס) היה אחד מגדולי תלמידי המגיד ממזריטש ואחד הדמויות האהובות ביותר בחסידות. אחיו היה רבי אלימלך מליז\'ינסק. ידוע בענוותנותו ובאהבת ישראל. סיפורים רבים מסופרים עליו — כיצד אמר: "כשיבואו לשפוט אותי, לא ישאלו אותי למה לא היית כמשה רבנו, אלא למה לא היית זושא".' },

  // ר' זושא מאניפולי — ב' שבט (הזמן המדויק)
  { id: 10369, importance_score: 88, story: 'רבי משולם זושא מאניפולי (ב\' שבט תק"ס) היה מגדולי החסידות, תלמיד מובהק של המגיד ממזריטש. אחיו, ר\' אלימלך מליז\'ינסק, היה גדול ממנו בגיל, אך שניהם נחשבו לגדולי הדור. מאמרו המפורסם: "כשיבואו לשפוט אותי, לא ישאלו אותי למה לא היית כמשה רבנו אלא למה לא היית זושא".' },

  // מרדכי יוסף ליינר — מראדז\'ין, כ"ו שבט
  { id: 11857, importance_score: 80, story: 'רבי מרדכי יוסף אלעזר ליינר מראדז\'ין (כ"ו שבט תרצ"ט), נכד מייסד חסידות איז\'ביצה-ראדז\'ין. ידוע בפעולתו למען קיום מצוות תכלת בציצית — חידש את תעשיית התכלת שנפסקה מן התלמוד. נהרג על קידוש ה\' בשואה.' },

  // =================== ניסן ===================

  // אברהם יהושע העשיל מאפטא — ה' ניסן
  { id: 11793, importance_score: 85 }, // already 85, keep story below
  // (story already set elsewhere)

  // שאול מורטירה — ניסן יד
  { id: 11788, importance_score: 74 },
]

let passed = 0, failed = 0

for (const u of specificUpdates) {
  const update = {}
  if (u.importance_score !== undefined) update.importance_score = u.importance_score
  if (u.story !== undefined) update.story = u.story
  const { error } = await sb.from('tzaddikim').update(update).eq('id', u.id)
  if (error) { console.error(`✗ id=${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}
console.log(`\n\nציונות ספציפיות — עודכנו: ${passed} | נכשלו: ${failed}`)

// Bulk baseline for remaining score=5 in Tishrei, Shvat, Nisan
console.log('\nמעדכן baseline 60 לציון=5...')
for (const month of ['תשרי', 'שבט', 'ניסן']) {
  const { error } = await sb.from('tzaddikim')
    .update({ importance_score: 60 })
    .eq('hebrew_month', month)
    .eq('importance_score', 5)
  if (error) console.error('✗ ' + month + ':', error.message)
  else console.log('✓ ' + month + ' ← baseline 60')
}
