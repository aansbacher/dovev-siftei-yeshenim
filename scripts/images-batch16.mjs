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
  // ר' אברהם יהושע העשיל מקופיטשניץ — דיוקן משנות ה-20 (נפטר תשכ"ז)
  { id: 11962, image_url: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Abraham_Joshua_Heshel%2C_1920s_%28cropped%29.png' },
  // ר' אליעזר הגר מוויז'ניץ — תמונה משנות ה-20 עם ר' אברהם יהושע העשיל
  { id: 11553, image_url: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Eliezer_Hager_%28r.%29_and_Abraham_Joshua_Heshel_%28l.%29%2C_1920s.png' },
  // ר' נתן אדלר מפרנקפורט — מצבה בבית הקברות בטונשטראסה, פרנקפורט (נפטר 1800)
  { id: 11719, image_url: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Cemetery-Battonnstrasse-GS-0081-0478-R._Natan_ben_Schimon_Adler_KaZ_%2817.09.1800%29.jpg' },
]

let passed = 0, failed = 0
for (const u of updates) {
  const { error } = await sb.from('tzaddikim').update({ image_url: u.image_url }).eq('id', u.id)
  if (error) { console.error(`✗ ${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}
console.log(`\n\nתמונות — עודכנו: ${passed} | נכשלו: ${failed}`)
