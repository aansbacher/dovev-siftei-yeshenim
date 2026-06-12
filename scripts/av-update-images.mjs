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

// All image URLs sourced from Wikimedia Commons / Hebrew Wikipedia
const updates = [
  // חוזה מלובלין — מצבה בבית עלמין היהודי בלובלין
  { id: 12079, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Old-Jewish-Cemetery.Lublin.mazevah.Chozeh.2015.mb.jpg/400px-Old-Jewish-Cemetery.Lublin.mazevah.Chozeh.2015.mb.jpg' },

  // ר' יצחק בלאזר — תמונת פורטרט היסטורית
  { id: 12081, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Yitzchak_Blazer.jpg/400px-Yitzchak_Blazer.jpg' },

  // מהר"ם בנט — פורטרט היסטורי
  { id: 12082, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/MarkusBenedikt.jpg/400px-MarkusBenedikt.jpg' },

  // שמשון ווערטהיימר — פורטרט מצויר מהמאה ה-18
  { id: 12084, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Samson_Wertheimer_portrait.jpg/400px-Samson_Wertheimer_portrait.jpg' },

  // ר' לוי יצחק שניאורסון
  { id: 12085, image_url: 'https://upload.wikimedia.org/wikipedia/he/5/57/Shneorson.jpg' },

  // ר' אהרן מבעלז
  { id: 12086, image_url: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Aharon_Rokeach.jpg' },

  // ר' חיים הלוי מבריסק
  { id: 12087, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Chaim_Soloveitchik.JPG/400px-Chaim_Soloveitchik.JPG' },

  // הסטייפלר
  { id: 12089, image_url: 'https://upload.wikimedia.org/wikipedia/he/thumb/c/cf/Staypaler.jpg/400px-Staypaler.jpg' },

  // ישועות יעקב — ר' יעקב אורנשטיין
  { id: 12090, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Orenschtein.jpg/400px-Orenschtein.jpg' },

  // דברי יואל מסאטמאר
  { id: 12091, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/JTeitelbaum.jpg/400px-JTeitelbaum.jpg' },

  // הרב הנזיר — ר' דוד כהן
  { id: 12092, image_url: 'https://upload.wikimedia.org/wikipedia/he/0/06/David_Cohen_Nazir.jpg' },

  // ר' שמואל סלנט
  { id: 12093, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Shmuel_Salant.jpg/400px-Shmuel_Salant.jpg' },

  // ר' יהודה פתיה
  { id: 12096, image_url: 'https://upload.wikimedia.org/wikipedia/he/thumb/3/30/%D7%94%D7%A8%D7%91_%D7%99%D7%94%D7%95%D7%93%D7%94_%D7%A4%D7%AA%D7%99%D7%94.jpg/400px-%D7%94%D7%A8%D7%91_%D7%99%D7%94%D7%95%D7%93%D7%94_%D7%A4%D7%AA%D7%99%D7%94.jpg' },

  // יצחק מאיר לוין
  { id: 12099, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Yitzhak_Meir_Levin.jpg/400px-Yitzhak_Meir_Levin.jpg' },

  // האדמו"ר מראדומסק
  { id: 12100, image_url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Rabbi_Shlomo_Chanoch_Hakohen_Rabinowicz.gif' },

  // ר' זלמן נחמיה גולדברג
  { id: 12102, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/%D7%94%D7%A8%D7%91_%D7%96%D7%9C%D7%9E%D7%9F_%D7%A0%D7%97%D7%9E%D7%99%D7%94_%D7%92%D7%95%D7%9C%D7%93%D7%91%D7%A8%D7%92.jpg/400px-%D7%94%D7%A8%D7%91_%D7%96%D7%9C%D7%9E%D7%9F_%D7%A0%D7%97%D7%9E%D7%99%D7%94_%D7%92%D7%95%D7%9C%D7%93%D7%91%D7%A8%D7%92.jpg' },
]

let passed = 0, failed = 0

for (const u of updates) {
  const { error } = await sb.from('tzaddikim').update({ image_url: u.image_url }).eq('id', u.id)
  if (error) { console.error(`✗ id=${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}

console.log(`\n\nתמונות — עודכנו: ${passed} | נכשלו: ${failed}`)
console.log('\nללא תמונה (אין בויקיפדיה):')
console.log('  12076 ערוגת הבושם, 12077 מבשר צדק, 12078 סבא מקלם,')
console.log('  12080 מסעוד חי רוקח, 12083 נחום איש גמזו, 12088 מרדכי בן הלל,')
console.log('  12094 בוהוש, 12095 מעם לועז, 12097 ברויאר, 12098 הגהות מיימוניות, 12101 מטה אפרים')
