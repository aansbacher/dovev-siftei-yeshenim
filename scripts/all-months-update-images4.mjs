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
  // לובביצ'ר רבי — תמוז ג (אוהל)
  { id: 11177, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Rebbe%27s_Tomb.JPG/400px-Rebbe%27s_Tomb.JPG' },

  // שמשון רפאל הירש — טבת כז
  { id: 11773, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Samson_Raphael_Hirsch_%28FL12173324%29.crop.jpg/400px-Samson_Raphael_Hirsch_%28FL12173324%29.crop.jpg' },

  // ר' אריה לייב לוין — ניסן ט
  { id: 11808, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Aryeh_Levin.jpg/400px-Aryeh_Levin.jpg' },

  // הרב שלמה גורן — חשוון כד
  { id: 11744, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Shlomo_Goren_and_Yehoshua_Kaniel_CROPPED_1964.jpg/400px-Shlomo_Goren_and_Yehoshua_Kaniel_CROPPED_1964.jpg' },

  // הרב יוסף חיים מבגדאד — אב כז (אותה תמונה כמו id 11660)
  { id: 11797, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Rabbi_Yosef_Haim.jpg/400px-Rabbi_Yosef_Haim.jpg' },
]

let passed = 0, failed = 0

for (const u of updates) {
  const { error } = await sb.from('tzaddikim').update({ image_url: u.image_url }).eq('id', u.id)
  if (error) { console.error(`✗ id=${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}

console.log(`\n\nתמונות — עודכנו: ${passed} | נכשלו: ${failed}`)
