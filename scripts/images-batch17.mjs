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
  // הרב שמואל אוירבך זצ"ל — דיוקן בלימוד
  { id: 10608, image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/%D7%94%D7%A8%D7%91_%D7%A9%D7%9E%D7%95%D7%90%D7%9C_%D7%90%D7%95%D7%99%D7%A2%D7%A8%D7%91%D7%9A_%D7%91%D7%9C%D7%99%D7%9E%D7%95%D7%93.JPG' },
  // הרב מנשה קליין — האונגוואר רב (תמונת 2006)
  { id: 11707, image_url: 'https://upload.wikimedia.org/wikipedia/commons/1/14/The_Rav.JPG' },
]

let passed = 0, failed = 0
for (const u of updates) {
  const { error } = await sb.from('tzaddikim').update({ image_url: u.image_url }).eq('id', u.id)
  if (error) { console.error(`✗ ${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}
console.log(`\n\nתמונות — עודכנו: ${passed} | נכשלו: ${failed}`)
