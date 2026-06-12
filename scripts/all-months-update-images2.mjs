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
  // גאון מווילנה — ניסן טו
  { id: 11879, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Vilna_Gaon%2C_Winograd_picture.jpg/400px-Vilna_Gaon%2C_Winograd_picture.jpg' },

  // שניאור זלמן מליאדי — בעל התניא, טבת כד
  { id: 11772, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Schneur_Zalman_of_Liadi.jpg/400px-Schneur_Zalman_of_Liadi.jpg' },

  // חפץ חיים — אלול כד
  { id: 11799, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Chofetz_Chaim%2C_1923.jpg/400px-Chofetz_Chaim%2C_1923.jpg' },

  // רב קוק — אלול ג
  { id: 11562, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D_-_%D7%94%D7%A8%D7%91_%D7%94%D7%9B%D7%94%D7%9F_%D7%A7%D7%95%D7%A7-JNF035679.jpeg/400px-%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D_-_%D7%94%D7%A8%D7%91_%D7%94%D7%9B%D7%94%D7%9F_%D7%A7%D7%95%D7%A7-JNF035679.jpeg' },

  // גרי"ש אלישיב — תמוז כח
  { id: 11990, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/RavElyashiv2.JPG/400px-RavElyashiv2.JPG' },

  // מהרש"א — כסלו ה
  { id: 11749, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Maharsha.jpg/400px-Maharsha.jpg' },

  // הרב שך — חשוון טז
  { id: 11820, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Rabbi_shah.jpg/400px-Rabbi_shah.jpg' },

  // ר' אהרן רוקח מבעלז — אב כא
  { id: 12086, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Aharon_Rokeach.jpg/400px-Aharon_Rokeach.jpg' },

  // האר"י הקדוש — אב ה (קבר בצפת)
  { id: 12068, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/%D7%A8%D7%91%D7%99_%D7%9E%D7%A9%D7%94.JPG/400px-%D7%A8%D7%91%D7%99_%D7%9E%D7%A9%D7%94.JPG' },

  // מגיד ממזריטש — כסלו יט
  { id: 11755, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Dov_Ber_of_Mezeritch.jpg/400px-Dov_Ber_of_Mezeritch.jpg' },
]

let passed = 0, failed = 0

for (const u of updates) {
  const { error } = await sb.from('tzaddikim').update({ image_url: u.image_url }).eq('id', u.id)
  if (error) { console.error(`✗ id=${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}

console.log(`\n\nתמונות — עודכנו: ${passed} | נכשלו: ${failed}`)
