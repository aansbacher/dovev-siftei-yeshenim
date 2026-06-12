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
  // הרב יעקב אדלשטיין — דיוקן
  { id: 10592, image_url: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Jakob_Edelstein%2C_rabbi.jpg' },
  // הרב עזרא עטייה — תמונת קבוצה: רבני פורת יוסף 1952 (ר' עזרא עטייה שלישי משמאל)
  { id: 10999, image_url: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/ABASH_1.jpg' },
  // ר' יצחק אלחנן ספקטור — דיוקן (עדכון מהקבר לדיוקן)
  { id: 12042, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Yitzchak_Elchanan_Spektor.jpg/400px-Yitzchak_Elchanan_Spektor.jpg' },
]

let passed = 0, failed = 0
for (const u of updates) {
  const { error } = await sb.from('tzaddikim').update({ image_url: u.image_url }).eq('id', u.id)
  if (error) { console.error(`✗ ${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}
console.log(`\n\nתמונות — עודכנו: ${passed} | נכשלו: ${failed}`)
