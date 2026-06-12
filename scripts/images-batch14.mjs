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
  // שלמה מקארלין — אוהל בולודימיר וולינסקי (אוקראינה)
  { id: 11976, image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Volodymyr_Volynska-Ohel_of_rebbe_Shlomo_of_Karlin-1.jpg' },
  // יצחק שמואל רג'יו — דיוקן, 1784–1855
  { id: 11622, image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Isaac_Samuel_Reggio.JPG' },
]

let passed = 0, failed = 0
for (const u of updates) {
  const { error } = await sb.from('tzaddikim').update({ image_url: u.image_url }).eq('id', u.id)
  if (error) { console.error(`✗ ${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}
console.log(`\n\nתמונות — עודכנו: ${passed} | נכשלו: ${failed}`)
