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
  // הרב אברהם יצחק הכהן קוק — תמונה מ-1924 (JNF)
  { id: 11562, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D_-_%D7%94%D7%A8%D7%91_%D7%94%D7%9B%D7%94%D7%9F_%D7%A7%D7%95%D7%A7-JNF035679.jpeg/400px-%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D_-_%D7%94%D7%A8%D7%91_%D7%94%D7%9B%D7%94%D7%9F_%D7%A7%D7%95%D7%A7-JNF035679.jpeg' },

  // המהר"ל מפראג — פסל בבית העירייה החדש בפראג (Saloun)
  { id: 11666, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Rabbi_L%C3%B6w_Saloun.JPG/400px-Rabbi_L%C3%B6w_Saloun.JPG' },

  // בן איש חי — ר' יוסף חיים מבגדאד
  { id: 11660, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Rabbi_Yosef_Haim.jpg/400px-Rabbi_Yosef_Haim.jpg' },

  // חפץ חיים — ר' ישראל מאיר הכהן מראדין (יום כ')
  { id: 11701, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Yisrael_Meir_Kagan.jpg/400px-Yisrael_Meir_Kagan.jpg' },

  // ר' יהונתן אייבשיץ — ציור מיוחס לו
  { id: 11692, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Eybeschuetz00.jpg/400px-Eybeschuetz00.jpg' },

  // הפוניבז'ר רב — ר' יוסף שלמה כהנמן
  { id: 11683, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Joseph_Shlomo_Kahaneman.jpg/400px-Joseph_Shlomo_Kahaneman.jpg' },

  // הרב בן ציון מאיר חי עוזיאל — רב ראשי לישראל
  { id: 11702, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Rabbi_Ben-Zion_Meir_Hai_Uziel.jpg/400px-Rabbi_Ben-Zion_Meir_Hai_Uziel.jpg' },

  // הרב אליהו לופיאן
  { id: 11684, image_url: 'https://upload.wikimedia.org/wikipedia/he/thumb/9/91/LOPYAN_E.jpg/400px-LOPYAN_E.jpg' },

  // הרב יחזקאל אברמסקי
  { id: 11705, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Rabbi_Yechezkel_Abramsky.jpg/400px-Rabbi_Yechezkel_Abramsky.jpg' },
]

let passed = 0, failed = 0

for (const u of updates) {
  const { error } = await sb.from('tzaddikim').update({ image_url: u.image_url }).eq('id', u.id)
  if (error) { console.error(`✗ id=${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}

console.log(`\n\nתמונות — עודכנו: ${passed} | נכשלו: ${failed}`)
