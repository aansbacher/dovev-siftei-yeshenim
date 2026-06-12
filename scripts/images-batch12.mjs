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
  // יוסף קארו — דיוקן גלויה מאת קונשטדט (תחילת המאה ה-20)
  { id: 10807, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Postcard_portrait_of_Joseph_Karo_by_Meir_Kunstadt%2C_early_1900s.jpg/400px-Postcard_portrait_of_Joseph_Karo_by_Meir_Kunstadt%2C_early_1900s.jpg' },
  // לוי יצחק מברדיצ'ב — דיוקן
  { id: 11288, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Lewi_Icchak_ben_Meir.webp/400px-Lewi_Icchak_ben_Meir.webp' },
  // חיים ויטאל — מצבה בקרית מלאכי
  { id: 10887, image_url: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/%D7%9E%D7%A6%D7%91%D7%AA_%D7%A8%D7%91%D7%99_%D7%97%D7%99%D7%99%D7%9D_%D7%95%D7%99%D7%98%D7%90%D7%9C_%D7%91%D7%A7%D7%A8%D7%99%D7%AA_%D7%9E%D7%9C%D7%90%D7%9B%D7%99.jpg' },
  // הרב עבדאללה סומך — דיוקן
  { id: 11667, image_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Hakham_Abdallah_Somekh.JPG' },
  // הרב משה שפירא — דיוקן
  { id: 10599, image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Rabbimosheshapira.JPG' },
]

let passed = 0, failed = 0
for (const u of updates) {
  const { error } = await sb.from('tzaddikim').update({ image_url: u.image_url }).eq('id', u.id)
  if (error) { console.error(`✗ ${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}
console.log(`\n\nתמונות — עודכנו: ${passed} | נכשלו: ${failed}`)
