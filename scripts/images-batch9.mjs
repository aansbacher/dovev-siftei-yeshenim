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
  // ר' אלימלך מליז'ינסק — אוהל בלז'ינסק
  { id: 10691, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Ohel_cadyka_Elimelecha_w_Le%C5%BCajsku.JPG/400px-Ohel_cadyka_Elimelecha_w_Le%C5%BCajsku.JPG' },
  // קלויזנבורגר — דיוקן
  { id: 11947, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Admor_sitting_with_bekashe.jpg/400px-Admor_sitting_with_bekashe.jpg' },
  // הפלאה — מצבת קבר פרנקפורט
  { id: 11934, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Cemetery-Battonnstrasse-GS-0079-0116-R._Pinchas_Halevi_Horowitz_%2829.06.1805%29.jpg/400px-Cemetery-Battonnstrasse-GS-0079-0116-R._Pinchas_Halevi_Horowitz_%2829.06.1805%29.jpg' },
  // יטב לב — מצבות סיגט
  { id: 11593, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Teie3.jpg/400px-Teie3.jpg' },
]

let passed = 0, failed = 0
for (const u of updates) {
  const { error } = await sb.from('tzaddikim').update({ image_url: u.image_url }).eq('id', u.id)
  if (error) { console.error(`✗ ${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}
console.log(`\n\nתמונות — עודכנו: ${passed} | נכשלו: ${failed}`)
