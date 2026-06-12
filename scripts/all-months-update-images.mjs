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
  // חזון איש — חשוון טו
  { id: 11809, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Chazon_Ish.jpg/400px-Chazon_Ish.jpg' },

  // לוי יצחק מברדיצ'ב — תשרי כה
  { id: 11927, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Lewi_Icchak_ben_Meir.webp/400px-Lewi_Icchak_ben_Meir.webp.png' },

  // בבא סאלי — שבט ד
  { id: 11777, image_url: 'https://upload.wikimedia.org/wikipedia/he/thumb/9/92/Baba_Sali.jpg/400px-Baba_Sali.jpg' },

  // רמב"ם — טבת כ
  { id: 11770, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Portrait_of_Moses_Maimonides_in_Thesaurus_antiquitatum_sacrarum.tif/lossy-page1-400px-Portrait_of_Moses_Maimonides_in_Thesaurus_antiquitatum_sacrarum.tif.jpg' },

  // ר' חיים מבריסק — אב כא
  { id: 12087, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Chaim_Soloveitchik.JPG/400px-Chaim_Soloveitchik.JPG' },

  // הסטייפלר — אב כג
  { id: 12089, image_url: 'https://upload.wikimedia.org/wikipedia/he/thumb/c/cf/Staypaler.jpg/400px-Staypaler.jpg' },

  // יואל טייטלבוים — סאטמר — אב כו
  { id: 12091, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/JTeitelbaum.jpg/400px-JTeitelbaum.jpg' },

  // אור החיים — קבר — תמוז טו
  { id: 11958, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Chaim_ibn_Attar_grave.JPG/400px-Chaim_ibn_Attar_grave.JPG' },
]

let passed = 0, failed = 0

for (const u of updates) {
  const { error } = await sb.from('tzaddikim').update({ image_url: u.image_url }).eq('id', u.id)
  if (error) { console.error(`✗ id=${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}

console.log(`\n\nתמונות — עודכנו: ${passed} | נכשלו: ${failed}`)
