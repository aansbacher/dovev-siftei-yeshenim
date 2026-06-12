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
  // הבאר יצחק — ר' יצחק אלחנן ספקטור (קבר קובנה)
  { id: 12042, image_url: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Yitzchak_elchanan_spektor.JPG' },
  // הרמ"ע מפאנו — אנציקלופדיה ברוקהאוס ואפרון
  { id: 12065, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Brockhaus_and_Efron_Jewish_Encyclopedia_e10_839-0.jpg/400px-Brockhaus_and_Efron_Jewish_Encyclopedia_e10_839-0.jpg' },
  // ר' ישראל מרוז'ין — דיוקן
  { id: 11828, image_url: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Yisrael_Friedman_of_Ruzhin.jpg' },
  // מהרי"ל — קבר בוורמס
  { id: 12111, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/J%C3%BCdischer_Friedhof_Worms-4243.jpg/400px-J%C3%BCdischer_Friedhof_Worms-4243.jpg' },
]

let passed = 0, failed = 0
for (const u of updates) {
  const { error } = await sb.from('tzaddikim').update({ image_url: u.image_url }).eq('id', u.id)
  if (error) { console.error(`✗ ${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}
console.log(`\n\nתמונות — עודכנו: ${passed} | נכשלו: ${failed}`)
