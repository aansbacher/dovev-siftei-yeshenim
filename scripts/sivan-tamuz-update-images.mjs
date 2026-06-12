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
const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const updates = [
  // === סיון ===
  // האמרי אמת מגור — ר' אברהם מרדכי אלתר
  { id: 11078, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Imrei_Emes.jpg/400px-Imrei_Emes.jpg' },

  // ר' מאיר שפירא מלובלין — 1933
  { id: 11104, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Yehuda_Meir_Shapiro_1933.jpg/400px-Yehuda_Meir_Shapiro_1933.jpg' },

  // הרב ישראל מאיר לאו
  { id: 11129, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/%D7%94%D7%A8%D7%91_%D7%9C%D7%90%D7%95.JPG/400px-%D7%94%D7%A8%D7%91_%D7%9C%D7%90%D7%95.JPG' },

  // הרב מרדכי אליהו
  { id: 11141, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Rav_Mordechai_Eliyahu.jpg/400px-Rav_Mordechai_Eliyahu.jpg' },

  // הבעל שם טוב — בול ישראל (אין תמונה אותנטית)
  { id: 11993, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Stamp_of_Israel_-_Baal_Shem_Tov.jpg/400px-Stamp_of_Israel_-_Baal_Shem_Tov.jpg' },

  // ר' חיים מוולוז'ין — מצבה
  { id: 11994, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Reb_chaim_mvolozhin.JPG/400px-Reb_chaim_mvolozhin.JPG' },

  // === תמוז ===
  // רש"י — גלויה מתחילת המאה ה-20
  { id: 11991, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Postcard_portrait_of_Rashi_by_Meir_Kunstadt%2C_early_1900s.jpg/400px-Postcard_portrait_of_Rashi_by_Meir_Kunstadt%2C_early_1900s.jpg' },

  // הגרי"ש אלישיב
  { id: 11990, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/RavElyashiv2.JPG/400px-RavElyashiv2.JPG' },

  // ר' אלחנן וסרמן
  { id: 11950, image_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0b/Elchonon_Wasserman.jpg/400px-Elchonon_Wasserman.jpg' },

  // שלמה גאנצפריד — בעל קיצור שולחן ערוך
  { id: 11984, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Shlomo_Ganzfried.jpg/400px-Shlomo_Ganzfried.jpg' },

  // בעל אור החיים — ציון הקבר בהר הזיתים
  { id: 11958, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Chaim_ibn_Attar_grave.JPG/400px-Chaim_ibn_Attar_grave.JPG' },

  // רמ"ק — ציון הקבר בצפת
  { id: 11979, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/%D7%A6%D7%99%D7%95%D7%9F_%D7%94%D7%A8%D7%9E%D7%A72.JPG/400px-%D7%A6%D7%99%D7%95%D7%9F_%D7%94%D7%A8%D7%9E%D7%A72.JPG' },
]

let passed = 0, failed = 0

for (const u of updates) {
  const { error } = await sb.from('tzaddikim').update({ image_url: u.image_url }).eq('id', u.id)
  if (error) { console.error(`✗ id=${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}

console.log(`\n\nתמונות — עודכנו: ${passed} | נכשלו: ${failed}`)
