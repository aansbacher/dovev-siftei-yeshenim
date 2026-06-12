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
  // הרמ"א — ר' משה איסרליש, אייר יח
  { id: 10995, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Postcard_portrait_of_Moses_Isserles_by_Meir_Kunstadt%2C_early_1900s_%28cropped%29.jpg/400px-Postcard_portrait_of_Moses_Isserles_by_Meir_Kunstadt%2C_early_1900s_%28cropped%29.jpg' },

  // ישראל סלנטר — אייר ב
  { id: 10906, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/%D7%A8%D7%91%D7%99_%D7%99%D7%A9%D7%A8%D7%90%D7%9C_%D7%A1%D7%9C%D7%A0%D7%98%D7%A8.png/400px-%D7%A8%D7%91%D7%99_%D7%99%D7%A9%D7%A8%D7%90%D7%9C_%D7%A1%D7%9C%D7%A0%D7%98%D7%A8.png' },

  // שך — שבתי הכהן, אדר א
  { id: 10573, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Shabsai_HaKohen.jpg/400px-Shabsai_HaKohen.jpg' },

  // פני מנחם — אדמו"ר מגור, אדר ט
  { id: 10624, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Pinchas_Menachem_Alter.jpg/400px-Pinchas_Menachem_Alter.jpg' },
]

let passed = 0, failed = 0

for (const u of updates) {
  const { error } = await sb.from('tzaddikim').update({ image_url: u.image_url }).eq('id', u.id)
  if (error) { console.error(`✗ id=${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}

console.log(`\n\nתמונות — עודכנו: ${passed} | נכשלו: ${failed}`)
