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
  // הריב"ש (יצחק בר ששת ברפת) — ציור קברו באלג'יר מאת וילהלם גנץ, 1881
  { id: 11554, image_url: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Rabi_Isaac_ben_Sheshe_tombstone.jpg' },
  // אהרן פרלוב הגדול מקרלין — קבר במלינוב, אוקראינה
  { id: 10831, image_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/%D0%9C%D0%BE%D0%B3%D0%B8%D0%BB%D0%B0_%D0%90%D0%B0%D1%80%D0%BE%D0%BD%D0%B0_%D0%9F%D0%B5%D1%80%D0%BB%D0%BE%D0%B2%D0%B0_01.jpg' },
  // האלשיך הקדוש (משה אלשיך) — ציון קברו בצפת
  { id: 10808, image_url: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/%D7%A6%D7%99%D7%95%D7%9F_%D7%94%D7%90%D7%9C%D7%A9%D7%99%D7%9A_%D7%94%D7%A7%D7%93%D7%95%D7%A9.JPG' },
  // נחום איש גמזו — תמונת הקבר
  { id: 12083, image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/68/Nachum_Ish_Gamzu%286%29.JPG' },
]

let passed = 0, failed = 0
for (const u of updates) {
  const { error } = await sb.from('tzaddikim').update({ image_url: u.image_url }).eq('id', u.id)
  if (error) { console.error(`✗ ${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}
console.log(`\n\nתמונות — עודכנו: ${passed} | נכשלו: ${failed}`)
